"use server"
import { db } from "@/lib/db";

export async function checkCode(code: string) {
  const exist = await db.ranking.findUnique({
    where: { code: code }});
  return !!exist; 
}
export async function addRanking(items:string[], name:string) {
  await db.ranking.create({
    if (items.length < 2) {throw new Error("Invalid input")}
    let code = ""
    for (let ind = 0; ind < 8; ind++) code += String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1) + 65))
    data: { name: name, creator: "Dennis Capone", code: code, elements: items.length, items: {
      create: items.map(n => ({name: n}))}}})
  return code
}
