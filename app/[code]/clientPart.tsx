'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { drawing } from "@/app/algorithms/drawings"
import { eloSystem } from "@/app/algorithms/eloSystem"
import { Pair } from "@/app/algorithms/drawings"
import { useEffect, useState, useCallback } from "react"

export default function ClientPart({ code, initialPlayers }: { code: string, initialPlayers: Pair | null }) {
  // Defining the states for the current and queued pairs //
  const [ currentPair, setCurrentPair ] = useState<Pair | null>(initialPlayers)
  const [ currentJackpot, setCurrentJackpot ] = useState<boolean | null>(false)
  const [ queue, setQueue ] = useState<(Pair | null)[]>([])
  const [ jackpot, setJackpot ] = useState<boolean[]>([])

  // Function to fill the queue with new pairs  //
  const fillQueue = useCallback(async () => {
    try {
      const result = await drawing(code)
      if (!result) return

      const [ pair, isJackpot ] = result
      if (pair) {
        setQueue(prev => [...prev, pair])
        setJackpot(prev => [...prev, isJackpot])
      } 
    } 
    catch (error) { console.error(error) }
  }, [code])

  // Prefill the queue with 10 pairs to avoid loading times during the game //
  useEffect(() => {
    const initQueue = async () => {
      for (let i = 0; i < 10; i++) {
        await fillQueue()
      }  
    }
    initQueue()
  }, [fillQueue])

  // Function to handle the vote and update the current pair //
  const handleVote = (code: string, vote: boolean) => {
    if (queue.length === 0) return
    fillQueue()
    eloSystem(code, vote)
    setCurrentPair(queue[0])
    setCurrentJackpot(jackpot[0])
    setQueue(prev => prev.slice(1))
    setJackpot(prev => prev.slice(1))
  }


  return (
    <>

      {currentJackpot && <div className="fixed inset-0 border-20 border-orange-500 pointer-events-none z-[9999]"></div>}

      <Link href={`/${code}/ranking`}><div className="mt-40 ml-40"><Button textcolor="" bcolor="" text="classifica" color="bg-green-500" /></div></Link>

      <div className='flex justify-center mt-5 gap-10 mt-50'>
        <button onClick={() => { handleVote(code, true) }}>
          <Button textcolor="" color="" bcolor="" text={currentPair?.p1.name || ""} />
        </button>
        <button onClick={() => { handleVote(code, false) }}>
          <Button text={currentPair?.p2.name || ""} textcolor="" bcolor="" color="" />
        </button>
      </div>

      <Link href="/"><div className='flex justify-center mt-70'><Button textcolor="" bcolor="" text="Torna indietro" color="bg-red-300" /></div></Link>
    </>
  )
}