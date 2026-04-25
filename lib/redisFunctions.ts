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
export async function saveInRanking(ranking: Ranking, item: Item) {
  try {
    // Sorted set to store items based on points
    await fast_db.zadd(`fast_ranking:${ranking.code}`, {
      score: item.points,
      member: item.id.toString(),
    })

    // Hash to store item details //
    await fast_db.hset(`item:${item.id.toString()}`, { 
      name: item.name, 
    })

    // Hash to store ranking details //
    await fast_db.hset(`ranking:${ranking.code}`, {
      name: ranking.name,
      idA: ranking.idA.toString(),
      idB: ranking.idB.toString(),
    })
  } catch (error) { 
    throw new Error("Error during the saving process: " + error)
  }
}
