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
        votes: ranking.votes
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
      console.log(`No data for: ${code}`)
      return null
    }

    // Take all the items ids from Redis //
    const zsetArray = await fast_db.zrange<string[]>(`fast_ranking:${code}`, 0, -1, { withScores: true })
    if (zsetArray.length === 0) return null

    // Updating points //
    const updateQueries: Prisma.Prisma__ItemClient<ItemPrisma>[] = []
    for (let i = 0; i < zsetArray.length; i += 2) {
      const id = zsetArray[i]
      const points = Number(zsetArray[i + 1])

      updateQueries.push(
        db.item.update({
          where: { id: BigInt(id) },
          data: { points },
        })
      )
    }
    const votes = await fast_db.hget<bigint>(`ranking:${code}`, 'votes')
    if (votes) {
      await db.ranking.update({
        where: { code: code},
        data: { votes: { increment: BigInt(votes) } }
      })
    }
    await db.$transaction(updateQueries)
  } catch (error) {
    console.error('sync error: ', error)
  }
}

export async function syncAllRedisToDb() {
  const keys = await fast_db.keys('fast_ranking:*')

  for (const key of keys) {
    const code = key.replace('fast_ranking:', '')
    await syncRedisToDB(code)
  }
}
