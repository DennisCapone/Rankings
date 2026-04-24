"use server"
import { fast_db } from "@/lib/fast_db";

export async function eloSystem(aWinned: boolean) {
    const K = 100
    const idA = await fast_db.get("idA")                          // Take the id of the players from the database
    const idB = await fast_db.get("idB")
    const pointsA = await fast_db.zscore("points", idA);          // Take the points of the players from the ranking 
    const pointsB = await fast_db.zscore("points", idB);
    if (pointsA === null || pointsB === null) throw new Error("Player not found in the ranking")
    const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))          // Calculate the expected score of player A 
    const aInc = Math.round(aWinned ? K * (1 - expA) : -K * (expA))         // Calculate the points to add or remove to player A 
    await fast_db.zincrby("points", aInc, idA)                             // Update the points of players in the ranking 
    await fast_db.zincrby("points", -aInc, idB)}