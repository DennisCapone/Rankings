"use server"
import { db } from "@/lib/db";

export async function drawingNormal({params} : {params: Promise<{code:string}>}) {
  const { code } = await params
  const ranking = await db.ranking.findUnique({
    where: {code: code,},
    include: {items: {orderBy: { points: "desc" }}}})
  let chosen = [], total = 0, avaibleItems = [...ranking.items]
  for (const item of ranking.items) total += item.probability
  for (let i=0;i<2;i++) {
    let random = Math.random() * total, last = 0
    for (const item of ranking.items) {
      if ((i === 0 || chosen[0].id !== item.id) && random <= last += item.probability) {
        chosen[i] = item
        break}}
    if (!chosen[i]) {chosen[i] = ranking.items[ranking.items.length - 1];}
    total -= chosen[i].probability}
  return chosen
}
