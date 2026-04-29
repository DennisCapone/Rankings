'use server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'

// Function to check if a ranking code exists in the database //
export async function checkCode(code: string) {
  return await db.ranking.findUnique({ 
      where: { code: code } }
  )
}

// Function to add a new ranking to the database with the provided items and name //
export async function addRanking(items: string[], name: string) {

  // Generate a unique 8-character code for the ranking //
  let code = ''
  let check = true
  while (check) {
    for (let ind = 0; ind < 8; ind++) {
      code += String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1) + 65))
    }
    if (!await checkCode(code)) check = false
    else code = ''
  }
  
  // Create the new ranking in the database with the generated code, name, and items //
  await db.ranking.create({
    data: {
      name: name,
      creator: 'Dennis Capone',
      code: code,
      elements: items.length,
      items: {
        create: items.map(n => ({
          name: n,
          probability: 100 / items.length
        }))
      }
    }
  })
  
  return code
}
