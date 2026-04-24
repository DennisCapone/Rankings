import { fast_db } from "./fast_db";

export interface ItemClassifica {
  id: bigint;
  name: string;
  points: number;}
export async function salvaInClassifica(nomeClassifica: string, item: ItemClassifica) {
  try {
    await fast_db.zadd(`ranking:${nomeClassifica}`, {
      score: item.points,
      member: item.id,})
    await fast_db.hset(`item:${item.id}`, {name: item.name,})
  } catch (error) {throw new Error("Impossibile salvare nella classifica")}}