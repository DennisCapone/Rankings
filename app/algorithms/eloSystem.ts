'use server'
import { fast_db } from "@/lib/fast_db";

export async function eloSystem(code: string, aWinned: boolean, idA: number, idB: number) {
  const sensibility = 100  // Sensibility factor of the elo system //

  // Fetch the current pair of players from Redis and their points //
  const [ pointsA, pointsB] = await Promise.all([
    fast_db.zscore(`fast_ranking:${code}`, idA.toString()),
    fast_db.zscore(`fast_ranking:${code}`, idB.toString())
  ])
  if (pointsA === null || pointsB === null) throw new Error("Player not found in the ranking")
 
  // Elo algorithm //
  const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))
  const aInc = Math.round(aWinned ? sensibility * (1 - expA) : -sensibility * (expA))
  // Update the points of the two players in Redis using a pipeline to ensure atomicity //
  const pipeline = fast_db.pipeline();
  pipeline.zincrby(`fast_ranking:${code}`, aInc, idA);
  pipeline.zincrby(`fast_ranking:${code}`, -aInc, idB);
  await pipeline.exec()
}
