"use server"
import { db } from "@/lib/db";

export async function eloSystem( idA: bigint, idB: bigint, K: number, aWinned: boolean) {
    const itemA = await db.item.findUnique({where: { id: idA }, select: { points: true }});
    const itemB = await db.item.findUnique({where: { id: idB }, select: { points: true }});
    if (!itemA || !itemB) throw new Error("One or both items not found")
    const expA = 1 / (1 + Math.pow(10, (itemB.points-itemA.points)/400))
    const aInc = aWinned ? K*(1-expA) : -K*(expA)
    await Promise.all([
    await db.$transaction([
        db.$executeRaw`UPDATE "items" SET points = points + ${Math.round(aInc)} WHERE id = ${idA}`,
        db.$executeRaw`UPDATE "items" SET points = points - ${Math.round(aInc)} WHERE id = ${idB}`])])
}
