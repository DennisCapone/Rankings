"use server"
import { fast_db } from "@/lib/fast_db";

export async function drawingNormal() {
  interface Player {                                             // Defining player
    id: number
    score: number
    name: string}
  interface pair {                                               // Defining pair
    p1: Player; p2: Player
    diff: number}
  const rawData = await fast_db.hgetall<Record<string, number | string>>("points");     // Take all the players with their points from the ranking, the key is the id of the player and the value is the points of the player
  if (!rawData) return null;
  const players: Player[] = Object.entries(rawData).map(([idString, points]) => ({
    id: parseInt(idString),
    score: Number(points),
    name: String(idString)}))
  const pairs: pair[] = []
  for (let i=0; i<players.length; i++) {                          // Creating all the possible pairs
    for (let j=i+1;j<players.length;j++) {
      pairs.push({p1: players[i], p2:players[j], diff:Math.abs(players[i].score-players[j].score)})}}
  const jackpotPairs = pairs.length * 0.25
  pairs.sort((a, b) => a.diff - b.diff)                         // Sort the pairs by the difference of points between the two players
  pairs.splice(0, jackpotPairs)                                 // Remove the jackpots from the sort
  const r = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[r]
  return chosens}