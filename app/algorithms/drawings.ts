'use server'
import { fast_db } from '@/lib/fast_db'
import { syncDBtoRedis } from '@/lib/sync'
import { randomUUID } from 'crypto'
import { cookies } from 'next/headers'
import { pipeline } from 'stream'

// Define the interfaces for the items and pairs //
export interface Item {
  id: number,
  score: number, 
  name: string
}
export interface Pair {
  i1: Item,
  i2: Item, 
  diff: number,
  pairId: string,
  token: string,
  jackpot: boolean
}


export async function drawing(code: string) {
  // Get the sessionId //
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  // Check if the ranking exists in Redis, if not search it in Supabase //
  const exist = await fast_db.exists(`fast_ranking:${code}`)
  !exist && await syncDBtoRedis(code)
  
  // Defining the probability to get a jackpot //
  const lastJackpot = await fast_db.hget<number>(`ranking:${code}:${sessionId}`, 'lastJackpot')
  let probability = 0
  switch (lastJackpot) {
    case 4: probability = 15; break
    case 5: probability = 30; break
    case 6: probability = 50; break
    case 7: probability = 80; break
    case 8: probability = 100; break
  }

  // Decide if draw a jackpot based on probability //
  const jackpot = Math.random() * 100 <= probability

  // Setting the last jackpot //
  fast_db.pipeline().hset(`ranking:${code}:${sessionId}`, {
    lastJackpot: (jackpot) ? '0' : (Number(lastJackpot) + 1).toString()
  }).expire(`ranking:${code}:${sessionId}`, 86400).exec()

  // Catching all the items of the ranking and their points from Redis //
  const [ drawnedPairsRaw, pendingPairs , rawRanking ] = await Promise.all([
    fast_db.smembers<string[]>(`drawned_pairs:${code}:${sessionId}`) || [],
    fast_db.lrange<string>(`pending_queue:${code}:${sessionId}`, 0, -1) || [],
    fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true })
  ])
  if (!rawRanking || rawRanking.length === 0) return null

  // Parse the raw ranking data into a more usable format //
  const ranking: { member: string; score: number }[] = []
  for (let i = 0; i < rawRanking.length; i += 2) {
    ranking.push({
      member: String(rawRanking[i]),
      score: Number(rawRanking[i + 1])
    })
  }

  // Create the items array with the details of each player //
  const items: Item[] = []
  ranking.forEach((item) => {
    items.push({
      id: parseInt(item.member),
      score: item.score,
      name: ''
    })
  })
  if (items.length < 2) return null
  
  // Create all the possible pairs of items and filter out the already drawned ones //
  const drawned = new Set(drawnedPairsRaw)
  const pairs: Pair[] = []
  const token = randomUUID()
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const pairId = (items[i].id < items[j].id) ? `${items[i].id}-${items[j].id}` : `${items[j].id}-${items[i].id}`
      if ((!drawned.has(pairId)) && (!pendingPairs?.includes(pairId))) {
        pairs.push({
          i1: items[i],
          i2: items[j],
          diff: Math.abs(items[i].score - items[j].score), 
          pairId: pairId,
          token: token,
          jackpot: false
        })
      }
    }
  }
  if (pairs.length === 0) return null
  
  // Exclude the jackpots (10%) or the normals pair from the drawing //
  if (pairs.length > 1) {
    const jackpotPairs = Math.ceil(pairs.length * 0.1)
    pairs.sort((a, b) => a.diff - b.diff)
    jackpot ? pairs.splice(jackpotPairs, pairs.length - jackpotPairs) : pairs.splice(0, jackpotPairs)
  }

  // Randomly select a pair from the remaining and put it in a random order //
  const chosens = pairs[Math.floor(Math.random() * pairs.length)]
  if (Math.random() > 0.5) {
    const temp = chosens.i1
    chosens.i1 = chosens.i2
    chosens.i2 = temp
  }

  // Fetch the names of the chosens items //
  const [name1, name2] = await Promise.all([
    fast_db.hget<string>(`item:${chosens.i1.id.toString()}`, 'name'),
    fast_db.hget<string>(`item:${chosens.i2.id.toString()}`, 'name')
  ])
  chosens.i1.name = name1 || 'Unknown'
  chosens.i2.name = name2 || 'Unknown'
  chosens.jackpot = jackpot

  // Adding the drawned pair to the pending queue //
  const pipeline = fast_db.pipeline()

  pipeline.rpush(`pending_queue:${code}:${sessionId}`, chosens.pairId)
  pipeline.expire(`pending_queue:${code}:${sessionId}`, 86400)

  // Adding the pair's details to the hash //
  pipeline.hset(`pairs:${chosens.pairId}`, {
    i1_id: chosens.i1.id,
    i1_name: chosens.i1.name,
    i1_score: chosens.i1.score,
    i2_id: chosens.i2.id,
    i2_name: chosens.i2.name,
    i2_score: chosens.i2.score,
    diff: chosens.diff,
    pairId: chosens.pairId,
    token: chosens.token,
    jackpot: chosens.jackpot
  }).expire(`pairs:${code}:${chosens.pairId}`, 86400)

  // Adding the token to the token's hash //
  pipeline.hset(`token:${token}`, {
    idA: chosens.i1.id,
    idB: chosens.i2.id,
    pairId: chosens.pairId
  }).expire(`token:${token}`, 86400)

  await pipeline.exec()

  return chosens as Pair
}
