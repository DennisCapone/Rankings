"use server"
import { db } from "@/lib/db";

export async function eloSystem( idA: number, idB: number, K: number, aWinned: boolean) {
    const { data: itemA } = await db.from("items").select("points").eq('id', idA).single()
    const { data: itemB } = await db.from("items").select("points").eq('id', idB).single()
    const expA = 1 / (1 + Math.pow(10, (itemB.points-itemA.points)/400))
    const aInc = aWinned ? K*(1-expA) : -K*(expA)
    await Promise.all([
        db.rpc('increment_val', { row_id: idA, quantity: Math.round(aInc) }),
        db.rpc('increment_val', { row_id: idB, quantity: -Math.round(aInc) })
    ])
}
