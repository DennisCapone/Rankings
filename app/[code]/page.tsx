import ClientPart from '@/app/[code]/clientPart'
import { drawing } from '@/app/algorithms/drawings'
import { fast_db } from '@/lib/fast_db'
import { Pair } from '@/app/algorithms/drawings'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params
  if (code.length !== 8) notFound()

  // Check if the user have a session id and, in case, create it //
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  // Looking for a pending queue //
  const pendingQueueStr = await fast_db.get<string[]>(`active_queue:${code}:${sessionId}`)
  const pendingQueue: { pair: Pair, jackpot: boolean }[] = pendingQueueStr 
    ? (typeof pendingQueueStr === 'string' ? JSON.parse(pendingQueueStr) : pendingQueueStr) : []

  const currentPairStr = await fast_db.get<string>(`current_pair:${code}:${sessionId}`)
  let currentPair: Pair | null = currentPairStr 
    ? (typeof currentPairStr === 'string' ? JSON.parse(currentPairStr) : currentPairStr) : null

  // Calling the initial queue (9 + 1 elements) to prefetch it in background //
  const needed = 10 - pendingQueue.length
  const initialQueue: Pair[] = pendingQueue.map(q => q.pair)
  const initialJackpots: boolean[] = pendingQueue.map(q => q.jackpot)
  if (!currentPair && initialQueue.length > 0) {
    currentPair = initialQueue.shift() ?? null;
    initialJackpots.shift();
  }
  for (let i = 0; i < needed; i++) {
    const result = await drawing(code)
    if (!result) break
    const [ queue, jackpot ] = result
    initialQueue.push(queue)
    initialJackpots.push(jackpot)
  }

  const initialPair = initialQueue[0] ?? null
  if (initialQueue.length > 0) {
    initialQueue.shift()
    initialJackpots.shift()
  }

  // Save all the pairs in Redis // 
  if (currentPair) {
    await fast_db.set(`current_pair:${code}:${sessionId}`, JSON.stringify(currentPair))
  }
  const queueToSave = initialQueue.map((pair, i) => ({
    pair: pair,
    jackpot: false
  }));
  await fast_db.set(`active_queue:${code}:${sessionId}`, JSON.stringify(queueToSave));

  // Defining the number of the pairs //
  const itemsLength = await fast_db.zcard(`fast_ranking:${code}`)
  const numPairs = ((itemsLength) * ((itemsLength-1)/2))

  return <ClientPart code={code} initialPair={initialPair} numPairs={numPairs} initialQueue={initialQueue} initialJackpots={initialJackpots} />
}
