'use server'
import { fast_db } from "@/lib/fast_db";
import { syncRankings } from "@/lib/sync";

export async function drawingNormal(code: string) {
  const exists = await fast_db.exists(`fast_ranking:${code}`); if (!exists) await syncRankings(code)  // Sync the ranking from the database if it doesn't exist in redis
  interface Item {                                             // Defining player
    id: number, score: number, name: string}
  interface pair {                                               // Defining pair
    p1: Item; p2: Item, diff: number, pairId: string}
  const rawRanking = await fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true }) 
  if (!rawRanking || rawRanking.length === 0) return null
  const parsedRanking: { member: string; score: number }[] = []
  for (let i = 0; i < rawRanking.length; i += 2) parsedRanking.push({ member: String(rawRanking[i]), score: Number(rawRanking[i+1]) })
  const players: Item[] = await Promise.all(
    (parsedRanking as { member: string; score: number }[]).map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: parseInt(entry.member),
        score: entry.score,
        name: name || `Player ${entry.member}`}}))
  if (players.length < 2) return null;
  const drawnPairsRaw = (await fast_db.smembers<string[]>(`drawn_pairs:${code}`)) || [];
  const drawnSet = new Set(drawnPairsRaw);
  const pairs: pair[] = []
  for (let i=0; i<players.length; i++) {                          // Creating all the possible pairs
    for (let j=i+1;j<players.length;j++) {
      const pairId = players[i].id < players[j].id ? `${players[i].id}-${players[j].id}` : `${players[j].id}-${players[i].id}`
      if (!drawnSet.has(pairId)) pairs.push({p1: players[i], p2:players[j], diff:Math.abs(players[i].score-players[j].score), pairId})}}
  if (pairs.length === 0) return null
  const jackpotPairs = Math.floor(pairs.length * 0.25)
  pairs.sort((a, b) => a.diff - b.diff)                           // Sort the pairs by the difference of points between the two players
  pairs.splice(0, jackpotPairs)                                   // Remove the jackpots from the sort
  const r = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[r]
  await Promise.all([
    fast_db.hset(`ranking:${code}`, {idA: chosens.p1.id.toString(), idB: chosens.p2.id.toString()}),
    fast_db.sadd(`drawn_pairs:${code}`, chosens.pairId)
  ]);
  return chosens}