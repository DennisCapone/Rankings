'use server'
import { fast_db } from "@/lib/fast_db";
import { syncDBtoRedis } from "@/lib/sync";

// Define the interfaces for the items and pairs //
export interface Item {
  id: number,
  score: number, 
  name: string
}
export interface Pair {
  p1: Item,
  p2: Item, 
  diff: number,
  pairId: string
}

export async function drawing(code: string): Promise<[Pair, boolean] | null> {
  // Defining the probability to get a jackpot //
  const lastJackpot = await fast_db.hget<number>(`ranking:${code}`, 'lastJackpot')
  let probability = 0
  switch (lastJackpot) {
    case 4:
      probability = 15; break
    case 5:
      probability = 30; break
    case 6:
      probability = 50; break
    case 7:
      probability = 80; break
    case 8:
      probability = 100; break
  }

  // Decide if draw a jackpot based on probability //
  const random = Math.floor(Math.random() * 100)
  const jackpot = random <= probability

  // Setting the last jackpot //
  if (!jackpot) {
    fast_db.hset(`ranking:${code}`, {
      lastJackpot: (Number(lastJackpot) + 1).toString()
    })
  }
  else {
    fast_db.hset(`ranking:${code}`, {
      lastJackpot: "0"
    })
  }

  return drawings(code, jackpot)
}


// Function to get a pair of items out from the top 25% of closest scores //
async function drawings(code: string, jackpot: boolean): Promise<[Pair, boolean] | null> {
  // Check if the ranking exists in Redis, if not search it in Supabase //
  const exists = await fast_db.exists(`fast_ranking:${code}`)
  if (!exists) await syncDBtoRedis(code)

  // Catching all the items of the ranking and their points from Redis //
  const [ drawnPairsRaw, rawRanking ] = await Promise.all([
    fast_db.smembers<string[]>(`drawn_pairs:${code}`) || [],
    fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true })
  ])

  // Fetch the ranking from Redis  //
  if (!rawRanking || rawRanking.length === 0) return null

  // Parse the raw ranking data into a more usable format //
  const parsedRanking: { member: string; score: number }[] = []
  for (let i = 0; i < rawRanking.length; i += 2) {
    parsedRanking.push({
      member: String(rawRanking[i]),
      score: Number(rawRanking[i + 1])
    })
  }

  // Create the players array with the details of each player //
  const players: Item[] = []
  for (let i = 0; i < parsedRanking.length; i++) {
    players.push({
      id: parseInt(parsedRanking[i].member),
      score: parsedRanking[i].score,
      name: ""
    })
  }
  if (players.length < 2) return null;
  
  // Fetch all the already drawn pairs for this ranking //
  const drawnSet = new Set(drawnPairsRaw)
  
  // Create all the possible pairs of players and filter out the already drawn ones //
  const pairs: Pair[] = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const pairId = players[i].id < players[j].id ? `${players[i].id}-${players[j].id}` : `${players[j].id}-${players[i].id}`
      if (!drawnSet.has(pairId)) {
        pairs.push({
          p1: players[i],
          p2: players[j],
          diff: Math.abs(players[i].score - players[j].score), 
          pairId
        })
      }
    }
  }
  if (pairs.length === 0) return null
  
  // Exclude the jackpots or the normals pair from the drawing //
  const jackpotPairs = Math.floor(pairs.length * 0.25)
  pairs.sort((a, b) => a.diff - b.diff)
  if (jackpot) {
    pairs.splice(jackpotPairs, pairs.length - jackpotPairs)
  }
  else {
    pairs.splice(0, jackpotPairs)
  }

  // Randomly select a pair from the remaining and put it in a random order //
  const random = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[random]
  if (Math.random() > 0.5) {
    const temp = chosens.p1
    chosens.p1 = chosens.p2
    chosens.p2 = temp
  }

  // Fetch the names of the chosen players //
  const [name1, name2] = await Promise.all([
    fast_db.hget<string>(`item:${chosens.p1.id.toString()}`, "name"),
    fast_db.hget<string>(`item:${chosens.p2.id.toString()}`, "name")
  ])
  chosens.p1.name = name1 || "Sconosciuto"
  chosens.p2.name = name2 || "Sconosciuto"

  // Adding the drawned pair to the queue //
  const data = JSON.stringify({ idA: chosens.p1.id, idB: chosens.p2.id })
  await Promise.all([
    fast_db.lpush(`queue:${code}`, data),
    fast_db.sadd(`drawn_pairs:${code}`, chosens.pairId)
  ])

  return [chosens, jackpot]
}
