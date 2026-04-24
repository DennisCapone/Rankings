'use server'
import { fast_db } from "./fast_db";

export interface Item {
  id: bigint;
  name: string;
  points: number;}
export interface Ranking {
  code: string;
  name: string;
  idA: bigint;
  idB: bigint;}
export async function saveInRanking(ranking: Ranking, item: Item) {
  try {
    await fast_db.zadd(`fast_ranking:${ranking.code}`, {                        // Using sorted set to store items based on points
      score: item.points,
      member: item.id.toString(),})
    await fast_db.hset(`item:${item.id.toString()}`, {name: item.name,})   // Storing items details
    await fast_db.hset(`ranking:${ranking.code}`, {                        // Storing ranking details
      name: ranking.name,
      idA: ranking.idA.toString(),
      idB: ranking.idB.toString(),})
  } catch (error) {throw new Error("Error during the saving process: " + error)}}