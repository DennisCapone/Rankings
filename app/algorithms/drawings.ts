'use server'
import { fast_db } from "@/lib/fast_db";
import { syncDBtoRedis } from "@/lib/sync";

export async function drawingNormal(code: string) {
  // Check if the ranking exists in Redis, if not search it in Supabase //
  const exists = await fast_db.exists(`fast_ranking:${code}`)
  if (!exists) await syncDBtoRedis(code)

  // Define the interfaces for the items and pairs //
  interface Item {
    id: number,
    score: number, 
    name: string
  }
  interface pair {
    p1: Item,
    p2: Item, 
    diff: number,
    pairId: string
  }

  // Fetch the ranking from Redis  //
  const rawRanking = await fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true })
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
  const players: Item[] = await Promise.all(
    (parsedRanking as { member: string, score: number }[]).map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: parseInt(entry.member),
        score: entry.score,
        name: name || `Player ${entry.member}`
      }
    })
  )
  if (players.length < 2) return null;
  
  // Fetch all the already drawn pairs for this ranking to avoid repetitions //
  const drawnPairsRaw = (await fast_db.smembers<string[]>(`drawn_pairs:${code}`)) || []
  const drawnSet = new Set(drawnPairsRaw)

  // Create all the possible pairs of players and filter out the already drawn ones //
  const pairs: pair[] = []
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
  
  // Exclude the jackpots from the normal drawing //
  const jackpotPairs = Math.floor(pairs.length * 0.25)
  pairs.sort((a, b) => a.diff - b.diff)
  pairs.splice(0, jackpotPairs)

  // Randomly select a pair from the remaining //
  const random = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[random]

  return chosens
}



export async function drawingJackpot(code: string) {
  // Check if the ranking exists in Redis, if not search it in Supabase //
  const exists = await fast_db.exists(`fast_ranking:${code}`)
  if (!exists) await syncDBtoRedis(code)

  // Define the interfaces for the items and pairs //
  interface Item {
    id: number,
    score: number, 
    name: string
  }
  interface pair {
    p1: Item,
    p2: Item, 
    diff: number,
    pairId: string
  }

  // Fetch the ranking from Redis  //
  const rawRanking = await fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true })
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
  const players: Item[] = await Promise.all(
    (parsedRanking as { member: string, score: number }[]).map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: parseInt(entry.member),
        score: entry.score,
        name: name || `Player ${entry.member}`
      }
    })
  )
  if (players.length < 2) return null;
  
  // Fetch all the already drawn pairs for this ranking to avoid repetitions //
  const drawnPairsRaw = (await fast_db.smembers<string[]>(`drawn_pairs:${code}`)) || []
  const drawnSet = new Set(drawnPairsRaw)

  // Create all the possible pairs of players and filter out the already drawn ones //
  const pairs: pair[] = []
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
  
  // Exclude the jackpots from the normal drawing //
  const jackpotPairs = Math.floor(pairs.length * 0.25)
  pairs.sort((a, b) => a.diff - b.diff)
  pairs.splice(jackpotPairs, pairs.length - jackpotPairs)

  // Randomly select a pair from the remaining //
  const random = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[random]

  return chosens
}