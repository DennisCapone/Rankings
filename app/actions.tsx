"use server"
import { db } from "@/lib/db";

export async function checkCode(code: string) {
  const exist = await db.ranking.findUnique({where: { code: code }})        // Search the code in the database
  return !!exist}                                                           // and return if he found it

export async function addRanking(items:string[], name:string) {
  let code = ""; for (let ind = 0; ind < 8; ind++) code += String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1) + 65))    // make the code and create a ranking with the items in input
  await db.ranking.create({
    data: { name: name, creator: "Dennis Capone", code: code, elements: items.length, items: {                       // items in input
      create: items.map(n => ({name: n, probability: 100/items.length}))}}})
  return code
}
