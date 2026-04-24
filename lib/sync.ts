import { PrismaClient } from '@prisma/client';
import { saveInRanking } from './redisFunctions';

const prisma = new PrismaClient();
export async function sincronizzaClassificheDaSupabase() {
  try {
    const rankings = await prisma.ranking.findMany({include: {items: true,},})
    for (const ranking of rankings) {
      for (const item of ranking.items) {
        await saveInRanking(ranking.code, {
          id: item.id,
          name: item.name,
          points: item.points,})}}} 
  catch (error) {throw new Error("");}}