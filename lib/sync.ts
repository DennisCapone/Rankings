'use server'
import { PrismaClient } from '@prisma/client'
import { saveInRanking } from './redisFunctions'
import { Item, Ranking } from './redisFunctions'
import { fast_db } from './fast_db';

const prisma = new PrismaClient();
export async function syncRankings(code:string) {
  const exists = await fast_db.exists(`fast_ranking:${code}`);
  if (!exists) {const ranking = await prisma.ranking.findUnique({
      where: { code },
      include: { items: true },})
    if (!ranking) throw new Error("Ranking not found in the database")
    try {
      const rankingData: Ranking = {
        code: ranking.code,
        name: ranking.name,
        idA: 0n,
        idB: 0n,}
      const itemsData: Item[] = ranking.items.map((item) => ({
        id: BigInt(item.id),
        name: item.name,
        points: item.points,}))
      const savePromises = itemsData.map(item => saveInRanking(rankingData, item))
      await Promise.all(savePromises)
    } catch (error) {throw new Error("Error occurred while syncing rankings: " + error)}}}