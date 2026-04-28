'use server'
import { db } from '@/lib/db'
import { fast_db } from '@/lib/fast_db'
import { Prisma, Item as ItemPrisma } from '@prisma/client'
import { saveInRanking, Item, Ranking } from '@/lib/redisFunctions'

// Function to synchronize the rankings from between the database and Redis //
export async function syncDBtoRedis(code: string) {
  // Check if the ranking already exists in Redis //
  const exists = await fast_db.exists(`fast_ranking:${code}`)
  if (!exists) {
    const ranking = await db.ranking.findUnique({
      where: { code },
      include: { items: true },
    })
    if (!ranking) throw new Error('Ranking not found in the database')

    // Save the ranking and the items in Redis //
    try {
      const rankingData: Ranking = {
        code: ranking.code,
        name: ranking.name,
        chosens: {
          p1: { id: 0, name: '', score: 0 },
          p2: { id: 0, name: '', score: 0 },
          diff: 0,
          pairId: ''
        }
      }
      const items: Item[] = ranking.items.map((item) => ({
        id: BigInt(item.id),
        name: item.name,
        points: item.points,
      }))
      await saveInRanking(rankingData, items)
    } catch (error) { throw new Error('Error occurred while syncing rankings: ' + error) }
  }
}


export async function syncRedisToDB(code: string) {
  try {
    //  Check if the ranking exists in Redis before attempting to sync //
    const exists = await fast_db.exists(`fast_ranking:${code}`)
    if (!exists) {
      console.log(`Nessun dato in Redis per il ranking: ${code}`)
      return
    }

    // Take all the items ids from Redis //
    const itemIds = await fast_db.zrange(`fast_ranking:${code}`, 0, -1)
    if (itemIds.length === 0) return null

    // Updating points //
    const updateQueries: Prisma.Prisma__ItemClient<ItemPrisma>[] = []
    itemIds.map(async (id) => {
      // Takes the points of the item from Redis //
      const points = await fast_db.zscore(`fast_ranking:${code}`, id as string)

      // Update the points of the item in the database //
      if (points !== null) {
        updateQueries.push(
          db.item.update({
            where: { id: BigInt(id as string) },
            data: { points: Number(points) },
          })
        )
      }
    })
    await db.$transaction(updateQueries)
  } catch (error) {
    console.error('Errore durante la sincronizzazione da Redis a DB:', error)
  }
}
