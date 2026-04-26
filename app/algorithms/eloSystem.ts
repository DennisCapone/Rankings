'use server'
import { fast_db } from "@/lib/fast_db";

export async function eloSystem(code: string, aWinned: boolean) {
    const sensibility = 100  // Sensibility factor of the elo system //

    // Fetch the current pair of players from Redis and their points //
    const [ idA, idB] = await Promise.all([
      fast_db.hget<string>(`ranking:${code}`, "idA"),
      fast_db.hget<string>(`ranking:${code}`, "idB")
    ])
    const [ pointsA, pointsB] = await Promise.all([
      fast_db.zscore(`fast_ranking:${code}`, idA),
      fast_db.zscore(`fast_ranking:${code}`, idB)
    ])
    if (pointsA === null || pointsB === null) throw new Error("Player not found in the ranking")
    
    // Elo algorithm //
    const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))
    const aInc = Math.round(aWinned ? sensibility * (1 - expA) : -sensibility * (expA))

    // Update the points of the two players in Redis using a pipeline to ensure atomicity //
    const pipeline = fast_db.pipeline();
    pipeline.zincrby(`fast_ranking:${code}`, aInc, idA);
    pipeline.zincrby(`fast_ranking:${code}`, -aInc, idB);
    await pipeline.exec();

    // Save the current pair as drawn //
    await Promise.all([
    fast_db.hset(`ranking:${code}`, {
      idA: idA,
      idB: idB
    }),
    fast_db.sadd(`drawn_pairs:${code}`, `${idA}-${idB}`)
  ])
}