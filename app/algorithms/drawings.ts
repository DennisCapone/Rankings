"use server"
import { fast_db } from "@/lib/fast_db";

export async function drawingNormal({params} : {params: Promise<{code:string}>}) {
  const { code } = await params
  interface Player {                                             // Defining player
    id: number
    score: number
    name: string}
  interface pair {                                               // Defining pair
    p1: Player; p2: Player
    diff: number}

    const rawRanking = await fast_db.zrange(`fast_ranking:${code}`, 0, -1, { withScores: true }); if (!rawRanking) return null;
    const players: Player[] = await Promise.all(                                  // Transforming the raw ranking data into Player objects
    (rawRanking as { member: string; score: number }[]).map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: parseInt(entry.member),
        score: entry.score,
        name: name || `Player ${entry.member}`}}))
  const pairs: pair[] = []
  for (let i=0; i<players.length; i++) {                          // Creating all the possible pairs
    for (let j=i+1;j<players.length;j++) {
      pairs.push({p1: players[i], p2:players[j], diff:Math.abs(players[i].score-players[j].score)})}}
  const jackpotPairs = pairs.length * 0.25
  pairs.sort((a, b) => a.diff - b.diff)                         // Sort the pairs by the difference of points between the two players
  pairs.splice(0, jackpotPairs)                                 // Remove the jackpots from the sort
  const r = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[r]
  await fast_db.hset(`ranking:${code}`, {idA: chosens.p1.id.toString(), idB: chosens.p2.id.toString()})  // Save the current pair in redis for the elo system to work
  return chosens}