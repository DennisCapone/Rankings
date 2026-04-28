'use client'
import Button from '@/components/Button'
import Link from 'next/link'
import { drawing, Pair } from '@/app/algorithms/drawings'
import { eloSystem } from '@/app/algorithms/eloSystem'
import { useState } from 'react'

export default function ClientPart({ code, initialPlayer, initialQueue, initialJackpots, numPairs }: { code: string, initialPlayer: Pair | null, initialQueue: Pair[], initialJackpots: boolean[], numPairs: number}) {
  // Defining the states for the current and queued pairs //
  const [ playedPairs, setPlayedPairs ] = useState<number>(0)
  const [ currentPair, setCurrentPair ] = useState<Pair | null>(initialPlayer)
  const [ currentJackpot, setCurrentJackpot ] = useState<boolean | null>(false)
  const [ pairs, setPairs ] = useState<(Pair | null)[]>(initialQueue)
  const [ jackpots, setJackpots ] = useState<boolean[]>(initialJackpots)

  // Function to fill the queue with new pairs  //
  const fillQueue = async () => {
    try {
      const result = await drawing(code)
      if (result?.[0]) {
        const [ pair, isJackpot ] = result
        setPairs(prev => [...prev, pair])
        setJackpots(prev => [...prev, isJackpot])
      }
    } 
    catch (error) { console.error('fillQueue error: ' + error) }
  }

  // Function to handle the vote and update the current pair //
  const handleVote = (code: string, vote: boolean) => {
    fillQueue(),
    eloSystem(code, currentPair?.token || '', vote)
    setCurrentPair(pairs[0])
    setCurrentJackpot(jackpots[0])
    setPairs(prev => prev.slice(1))
    setJackpots(prev => prev.slice(1))
  }


  return (
    <>
      {currentJackpot && <div className='fixed inset-0 border-40 border-orange-500 pointer-events-none z-[9999]'></div>}

      <Link href={`/${code}/ranking`}><div className='mt-20 ml-10'><Button textcolor='' bcolor='' text='classifica' color='bg-green-500' /></div></Link>

      {<div className='mt-20 ml-[200px]'> <h1> {playedPairs}/{numPairs} </h1> </div>}

      <div className='flex justify-center mt-5 gap-10 mt-50'>
        <button onClick={() => { handleVote(code, true), setPlayedPairs(playedPairs+1) }}>
          <Button textcolor='' color='' bcolor='' text={currentPair?.p1.name || ''} />
        </button>
        <button onClick={() => { handleVote(code, false), setPlayedPairs(playedPairs+1) }}>
          <Button text={currentPair?.p2.name || ''} textcolor='' bcolor='' color='' />
        </button>
      </div>

      <Link href='/'><div className='flex justify-center mt-70'><Button textcolor='' bcolor='' text='Torna indietro' color='bg-red-300' /></div></Link>
    </>
  )
}
