'use client'
import Button from '@/components/Button'
import Link from 'next/link'
import { drawing, Pair } from '@/app/algorithms/drawings'
import { eloSystem } from '@/app/algorithms/eloSystem'
import { useState, useRef } from 'react'

export default function ClientPart({ code, startingQueue, numPairs }: { code: string, startingQueue: Pair[], numPairs: number}) {
  // Defining the states for the current and queued pairs //
  const [ queue, setQueue ] = useState<Pair[]>(startingQueue)
  const [ currentPair, setCurrentPair ] = useState<Pair>(queue[0])
  const [ played, setPlayed ] = useState(0)

  // Function to fill the queue with new pairs  //
  const fillQueue = async () => {
    const newPair = await drawing(code) as Pair
    const newQueue: Pair[] = queue
    newQueue.push(newPair)
  }

  const serverQueue = useRef<Promise<void>>(Promise.resolve())
  const handleVote = async (code: string, vote: boolean) => {
    // Give a new question to the user //
    const newQueue = queue
    newQueue.shift()
    if (!newQueue) return null
    setQueue(newQueue)
    setCurrentPair(queue[0])

    // Call some function in background //
    serverQueue.current = serverQueue.current.then(async () => {
      try {
        Promise.all([
          eloSystem(code, currentPair?.token || '', vote),
          fillQueue()
        ])
      } catch (error) {
        console.error("Syncronization error: ", error)
      }
    })
  }


  return (
    <>
      {currentPair.jackpot && <div className='fixed inset-0 border-40 border-orange-500 pointer-events-none z-[9999]'></div>}

      <Link href={`/${code}/ranking`}><div className='mt-20 ml-10'><Button textcolor='' bcolor='' text='classifica' color='bg-green-500' /></div></Link>

      {<div className='mt-20 ml-[200px]'> <h1> {played}/{numPairs} </h1> </div>}

      <div className='flex justify-center mt-5 gap-10 mt-50'>
        <button onClick={() => { handleVote(code, true), setPlayed(played+1) }}>
          <Button textcolor='' color='' bcolor='' text={currentPair?.i1.name || 'Loading...'} />
        </button>
        <button onClick={() => { handleVote(code, false), setPlayed(played+1) }}>
          <Button text={currentPair?.i2.name || 'Loading...'} textcolor='' bcolor='' color='' />
        </button>
      </div>

      <Link href='/'><div className='flex justify-center mt-70'><Button textcolor='' bcolor='' text='Torna indietro' color='bg-red-300' /></div></Link>
    </>
  )
}
