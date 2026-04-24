import { PrismaClient } from '@prisma/client';
import { salvaInClassifica } from './redisFunctions';

const prisma = new PrismaClient();
export async function sincronizzaClassificheDaSupabase() {
  try {
    const classificheSupabase = await prisma.ranking.findMany({include: {items: true,},})
    for (const classifica of classificheSupabase) {
      for (const item of classifica.items) {
        await salvaInClassifica(classifica.code, {
          id: item.id,
          name: item.name,
          points: item.points,})}}} 
  catch (error) {throw new Error("Impossibile sincronizzare i dati");}}