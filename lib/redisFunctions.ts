import { fast_db } from "@/lib/fast_db";

// Defining the interfaces for the items and rankings to ensure type safety and better code readability //
export interface Item {
  id: bigint;
  name: string;
  points: number;
}
export interface Ranking {
  code: string;
  name: string;
  idA: bigint;
  idB: bigint;
}

// Function to save an item in the ranking //
export async function saveInRanking(ranking: Ranking, items: Item[]) {
  try {
    const pipeline = fast_db.pipeline()

    items.forEach((item) => {
      // Sorted set to store items based on points
      pipeline.zadd(`fast_ranking:${ranking.code}`, {
        score: item.points,
        member: item.id.toString(),
      })

      // Hash to store item details //
      pipeline.hset(`item:${item.id.toString()}`, { 
        name: item.name,
        extractions: 0
      })
    })

    // Hash to store ranking details //
    pipeline.hset(`ranking:${ranking.code}`, {
      name: ranking.name,
      lastJackpot: 0,
      idA: ranking.idA.toString(),
      idB: ranking.idB.toString(),
    })

    await pipeline.exec()
  } catch (error) { 
    throw new Error("Error during the saving process: " + error)
  }
}
