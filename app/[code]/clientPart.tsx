'use client'
import Button from "@/components/Button"
import Link from "next/link"
import { drawing } from "@/app/algorithms/drawings"
import { eloSystem } from "@/app/algorithms/eloSystem"
import { Pair } from "@/app/algorithms/drawings"
import { useEffect, useState, useCallback } from "react"

export default function ClientPart({ code, initialPlayers, numPairs }: { code: string, initialPlayers: Pair | null, numPairs: number}) {
  // Defining the states for the current and queued pairs //
  const [ currentPair, setCurrentPair ] = useState<Pair | null>(initialPlayers)
  const [ currentJackpot, setCurrentJackpot ] = useState<boolean | null>(false)
  const [ pairs, setPairs ] = useState<(Pair | null)[]>([])
  const [ jackpots, setJackpots ] = useState<boolean[]>([])

  // Function to fill the queue with new pairs  //
  const fillQueue = useCallback(async () => {
    try {
      const result = await drawing(code)
      if (result?.[0]) {
        const [ pair, isJackpot ] = result
        setPairs(prev => [...prev, pair])
        setJackpots(prev => [...prev, isJackpot])
      }
      else {
        console.log('benni quella bestia')
      }
    } 
    catch (error) { console.error('fillQueue error: ' + error) }
  }, [code])

  // Prefill the queue with 10 pairs to avoid loading times during the game //
  useEffect(() => {
    const initQueue = async () => {
      for (let i = 0; i < 10; i++) {
        fillQueue()
      } 
    }
    initQueue()
  }, [fillQueue])

  // Function to handle the vote and update the current pair //
  const handleVote = (code: string, vote: boolean) => {
    fillQueue()
    console.log(pairs)
    eloSystem(code, vote)
    setCurrentPair(pairs[0])
    setCurrentJackpot(jackpots[0])
    setPairs(prev => prev.slice(1))
    setJackpots(prev => prev.slice(1))
  }


  return (
    <>
      {currentJackpot && <div className="fixed inset-0 border-40 border-orange-500 pointer-events-none z-[9999]"></div>}

      <Link href={`/${code}/ranking`}><div className="mt-20 ml-20"><Button textcolor="" bcolor="" text="classifica" color="bg-green-500" /></div></Link>

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
