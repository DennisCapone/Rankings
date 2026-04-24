'use server'
import { fast_db } from "@/lib/fast_db";
import { syncRankings } from "@/lib/sync";

export async function drawingNormal(code: string) {
  const exists = await fast_db.exists(`fast_ranking:${code}`); if (!exists) await syncRankings(code)  // Sync the ranking from the database if it doesn't exist in redis
  interface Item {                                             // Defining player
    id: number, score: number, name: string}
  interface pair {                                               // Defining pair
    p1: Item; p2: Item, diff: number}
  const rawRanking = await fast_db.zrange(`fast_ranking:${code}`, 0, -1, { withScores: true }); if (!rawRanking) return null;
  const players: Item[] = await Promise.all(                                  // Transforming the raw ranking data into Player objects
    (rawRanking as { member: string; score: number }[]).map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: parseInt(entry.member),
        score: entry.score,
        name: name || `Player ${entry.member}`}}))
  if (players.length < 2) return null;
  const pairs: pair[] = []
  for (let i=0; i<players.length; i++) {                          // Creating all the possible pairs
    for (let j=i+1;j<players.length;j++) {
      pairs.push({p1: players[i], p2:players[j], diff:Math.abs(players[i].score-players[j].score)})}}
  const jackpotPairs = Math.floor(pairs.length * 0.25)
  pairs.sort((a, b) => a.diff - b.diff)                           // Sort the pairs by the difference of points between the two players
  pairs.splice(0, jackpotPairs)                                   // Remove the jackpots from the sort
  const r = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[r]
  await fast_db.hset(`ranking:${code}`, {idA: chosens.p1.id.toString(), idB: chosens.p2.id.toString()})  // Save the current pair in redis for the elo system to work
  return chosens}