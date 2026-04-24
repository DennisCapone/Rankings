import { PrismaClient } from '@prisma/client'
import { saveInRanking } from './redisFunctions'
import { Item, Ranking } from './redisFunctions'

const prisma = new PrismaClient();
export async function syncRankings() {


  try {
    const rankings = await prisma.ranking.findMany({include: {items: true,},})
    for (const ranking of rankings) {
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
      await Promise.all(savePromises)}
    } catch (error) {throw new Error("Error occurred while syncing rankings: " + error)}}