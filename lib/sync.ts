'use server'
import { db } from '@/lib/db'
import { fast_db } from '@/lib/fast_db'
import { saveInRanking, Item, Ranking } from '@/lib/redisFunctions'

// Function to synchronize the rankings from between the database and Redis //
export async function syncRankings(code: string) {
  // Check if the ranking already exists in Redis //
  const exists = await fast_db.exists(`fast_ranking:${code}`)
  if (!exists) {
    const ranking = await db.ranking.findUnique({
      where: { code },
      include: { items: true },
    })
    if (!ranking) throw new Error("Ranking not found in the database")

    // Save the ranking and its items in Redis //
    try {
      const rankingData: Ranking = {
        code: ranking.code,
        name: ranking.name,
        idA: 0n,
        idB: 0n,
      }
      const itemsData: Item[] = ranking.items.map((item) => ({
        id: BigInt(item.id),
        name: item.name,
        points: item.points,
      }))
      const savePromises = itemsData.map(item => saveInRanking(rankingData, item))
      await Promise.all(savePromises)
    } catch (error) { throw new Error("Error occurred while syncing rankings: " + error) }
  }
}
