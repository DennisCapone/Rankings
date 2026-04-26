'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { useState } from "react"
import { drawingNormal } from "@/app/algorithms/drawings"
import { eloSystem } from "@/app/algorithms/eloSystem"
import { Pair } from "@/app/algorithms/drawings"

export default function ClientPart({ code, initialPlayers }: { code: string, initialPlayers: Pair | null }) {
  // Defining the states for the names of the two players in the current question //
  const [textOne, setTextOne] = useState(initialPlayers?.p1.name || "Caricamento...")
  const [textTwo, setTextTwo] = useState(initialPlayers?.p2.name || "Caricamento...")

  // Function to give a new question to the user //
  const giveQuestion = async () => {
    try {
      const players = await drawingNormal(code)
      if (!players) throw new Error("No players found")

      setTextOne(players.p1.name)
      setTextTwo(players.p2.name)
    } 
    catch (error) { console.error(error) }
  }

  return (
    <>
      <Link href={`/${code}/ranking`}><Button textcolor="" bcolor="" text="classifica" color="bg-green-500" /></Link>

      <div className='flex justify-center mt-5 gap-10 mt-50'>
        <button onClick={() => { eloSystem(code, true); giveQuestion() }}>
          <Button textcolor="" color="" bcolor="" text={textOne} />
        </button>
        <button onClick={() => { eloSystem(code, false); giveQuestion() }}>
          <Button text={textTwo} textcolor="" bcolor="" color="" />
        </button>
      </div>

      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}