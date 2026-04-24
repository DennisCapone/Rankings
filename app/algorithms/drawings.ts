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
  const players: Player[] = []
  const pairs: pair[] = []
  for (let i=0; i<players.length; i++) {                          // Creating all the possible pairs
    for (let j=i+1;j<players.length;j++) {
      pairs.push({p1: players[i], p2:players[j], diff:players[i].score-players[j].score})}}
  const jackpotPairs = (((players.length + 1) * players.length) / 2) * 0.1
  pairs.splice(0, jackpotPairs)                                 // Remove the jackpots from the sort
  const r = Math.floor(Math.random() * pairs.length)
  const chosens = pairs[r]
  return chosens}