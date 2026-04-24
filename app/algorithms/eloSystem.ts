"use server"
import { fast_db } from "@/lib/fast_db";

export async function eloSystem(code: string, aWinned: boolean) {
    const K = 100
    const idA = await fast_db.hget<string>(`ranking:${code}`, "idA")            
    const idB = await fast_db.hget<string>(`ranking:${code}`, "idB")
    if (!idA || !idB) return
    const rawPointsA = await fast_db.zscore(`fast_ranking:${code}`, idA)
    const rawPointsB = await fast_db.zscore(`fast_ranking:${code}`, idB)
    if (rawPointsA === null || rawPointsB === null) return;
    const pointsA = Number(rawPointsA)
    const pointsB = Number(rawPointsB)
    if (isNaN(pointsA) || isNaN(pointsB)) return
    const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))          
    const aInc = Math.round(aWinned ? K * (1 - expA) : -K * (expA))         
    await fast_db.zincrby(`fast_ranking:${code}`, aInc, idA)                             
    await fast_db.zincrby(`fast_ranking:${code}`, -aInc, idB)}