"use server"
import { fast_db } from "@/lib/fast_db";

export async function eloSystem(code: string, aWinned: boolean) {
    const K = 100
    const idA = await fast_db.hget<string>(`ranking:${code}`, "idA")            // Take the current pair of players from redis
    const idB = await fast_db.hget<string>(`ranking:${code}`, "idB")
    const pointsA = Number(await fast_db.zscore(`fast_ranking:${code}`, idA))          // Take the points of the players from the ranking 
    const pointsB = Number(await fast_db.zscore(`fast_ranking:${code}`, idB));
    if (pointsA === null || pointsB === null) throw new Error("Player not found in the ranking")
    const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))          // Calculate the expected score of player A 
    const aInc = Math.round(aWinned ? K * (1 - expA) : -K * (expA))         // Calculate the points to add or remove to player A 
    await fast_db.zincrby(`fast_ranking:${code}`, aInc, idA)                             // Update the points of players in the ranking 
    await fast_db.zincrby(`fast_ranking:${code}`, -aInc, idB)}