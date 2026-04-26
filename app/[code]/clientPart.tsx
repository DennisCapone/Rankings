'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { drawingNormal } from "@/app/algorithms/drawings"
import { eloSystem } from "@/app/algorithms/eloSystem"
import { Pair } from "@/app/algorithms/drawings"
import { useEffect, useState, useCallback } from "react"

export default function ClientPart({ code, initialPlayers }: { code: string, initialPlayers: Pair | null }) {
  // Defining the states for the current and queued pairs //
  const [ currentPair, setCurrentPair ] = useState<Pair | null>(initialPlayers)
  const [ queue, setQueue ] = useState<(Pair | null)[]>([])

  // Function to fill the queue with new pairs  //
  const fillQueue = useCallback(async () => {
    try {
      const pair = await drawingNormal(code)
      if (!pair) throw new Error("No pair found")
      setQueue(prev => [...prev, pair])
      } 
    catch (error) { console.error(error) }
  }, [code])

  // Prefill the queue with 3 pairs to avoid loading times during the game //
  useEffect(() => {
    const initQueue = async () => {
      await Promise.all([fillQueue(), fillQueue(), fillQueue()])
    }
    initQueue()
  }, [fillQueue])

  // Function to handle the vote and update the current pair //
  const handleVote = async () => {
    // If the queue is empty, wait for a new pair //
    if (queue.length === 1) await fillQueue()
    else fillQueue()

    setCurrentPair(queue[0])
    setQueue(prev => prev.slice(1))
  }


  return (
    <>
      <Link href={`/${code}/ranking`}><Button textcolor="" bcolor="" text="classifica" color="bg-green-500" /></Link>

      <div className='flex justify-center mt-5 gap-10 mt-50'>
        <button onClick={() => { eloSystem(code, true); handleVote() }}>
          <Button textcolor="" color="" bcolor="" text={currentPair?.p1.name || ""} />
        </button>
        <button onClick={() => { eloSystem(code, false); handleVote() }}>
          <Button text={currentPair?.p2.name || ""} textcolor="" bcolor="" color="" />
        </button>
      </div>

      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}