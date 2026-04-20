"use server"
import { db } from "@/lib/db";

export async function handleClick(code: string) {
  const exist = await db.ranking.findUnique({
    where: { code: code }
  });
  return !!exist; 
}

export async function addRanking(code:string, items:string[], name:string) {
  await db.ranking.create({
    data: {
      name: name,
      creator: "Dennis Capone",
      code: code,
      items: {
        create: items.map(n => ({
          name: n
        }))
        }
      }
    }
  )
  console.log("ho salvato!")


  return null
}