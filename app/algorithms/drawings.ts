"use server"
import { fast_db } from "@/lib/fast_db";
import { syncRankings } from "@/lib/sync";

export async function drawingNormal(code: string) {
  const exists = await fast_db.exists(`fast_ranking:${code}`); 
  if (!exists) await syncRankings(code)  
  interface Item { id: number, score: number, name: string }
  interface pair { p1: Item; p2: Item, diff: number }
  const rawArray = await fast_db.zrange<any[]>(`fast_ranking:${code}`, 0, -1, { withScores: true }); 
  if (!rawArray || rawArray.length === 0) return null;
  const parsedRanking: { member: string; score: number }[] = [];
  if (typeof rawArray[0] === 'object' && rawArray[0] !== null) {
    parsedRanking.push(...rawArray)
  } else for (let i = 0; i < rawArray.length; i += 2) parsedRanking.push({ member: String(rawArray[i]), score: Number(rawArray[i+1]) })
  const validRanking = parsedRanking.filter(entry => entry.member && !isNaN(Number(entry.member)));
  const players: Item[] = await Promise.all(                                  
    validRanking.map(async (entry) => {
      const name = await fast_db.hget<string>(`item:${entry.member}`, "name")
      return {
        id: parseInt(entry.member),
        score: entry.score,
        name: name || `Player ${entry.member}`}}))
  if (players.length < 2) return null;
  const pairs: pair[] = []
  for (let i=0; i<players.length; i++) {                          
    for (let j=i+1;j<players.length;j++) pairs.push({p1: players[i], p2:players[j], diff:Math.abs(players[i].score-players[j].score)})}
  const jackpotPairs = Math.floor(pairs.length * 0.25)
  pairs.sort((a, b) => a.diff - b.diff)                           
  pairs.splice(0, jackpotPairs)  
  if (pairs.length === 0) return null
  const r = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[r]
  await fast_db.hset(`ranking:${code}`, {idA: chosens.p1.id.toString(), idB: chosens.p2.id.toString()})  
  return chosens}