import ClientPart from '@/app/[code]/clientPart'
import { drawing } from '@/app/algorithms/drawings'
import { fast_db } from '@/lib/fast_db'
import { Pair } from '@/app/algorithms/drawings'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params
  if (code.length !== 8 && code !== 'PONTECCHIO') notFound()

  // Check if the user have a session id and, in case, create it //
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value

  // Looking for a pending queue //
  const pendingQueueStr = await fast_db.get<string>(`active_queue:${code}:${sessionId}`)
  let pendingQueue: { pair: Pair, jackpot: boolean }[] = pendingQueueStr 
    ? (typeof pendingQueueStr === 'string' ? JSON.parse(pendingQueueStr) : pendingQueueStr) : []
  const currentPairStr = await fast_db.get<string>(`current_pair:${code}:${sessionId}`)
  let currentPair: Pair | null = currentPairStr 
    ? (typeof currentPairStr === 'string' ? JSON.parse(currentPairStr) : currentPairStr) : null
  const currentJackpotStr = await fast_db.get<string>(`current_jackpot:${code}:${sessionId}`)
  let currentJackpot: boolean = String(currentJackpotStr) === 'true'

  // 
  const drawnPairsRaw = await fast_db.smembers<string[]>(`drawn_pairs:${code}:${sessionId}`) || []
  const drawned = new Set(drawnPairsRaw)
  if (currentPair && drawned.has(currentPair.pairId)) {
    currentPair = null
    currentJackpot = false
  }
  pendingQueue = pendingQueue.filter(q => !drawned.has(q.pair.pairId))

  // Calling the initial queue (9 + 1 elements) to prefetch it in background //
  const needed = 9 - pendingQueue.length
  const initialQueue: Pair[] = pendingQueue.map(q => q.pair)
  const initialJackpots: boolean[] = pendingQueue.map(q => q.jackpot)
  for (let i = 0; i < needed; i++) {
    const result = await drawing(code)
    if (!result) break
    const [ queue, jackpot ] = result
    initialQueue.push(queue)
    initialJackpots.push(jackpot)
  }

  // If there isn't a current pair, take it from the queue //
  let isNewPair = false
  if (!currentPair) {
    currentPair = initialQueue.shift() ?? null
    currentJackpot = initialJackpots.shift() ?? false
    isNewPair = true
  }

  // Save the pairs in Redis // 
  if (isNewPair) {
    if (currentPair) {
      await fast_db.set(`current_pair:${code}:${sessionId}`, JSON.stringify(currentPair), {ex: 86400})
      await fast_db.set(`current_jackpot:${code}:${sessionId}`, JSON.stringify(currentJackpot), {ex: 86400})
    }
    const queueToSave = initialQueue.map((pair, i) => ({
      pair: pair,
      jackpot: initialJackpots[i]
    }))
    await fast_db.set(`active_queue:${code}:${sessionId}`, JSON.stringify(queueToSave), {ex: 86400})
  }

  const queueToSave = initialQueue.map((pair, i) => ({
    pair: pair,
    jackpot: initialJackpots[i]
  }))
  await fast_db.set(`active_queue:${code}:${sessionId}`, JSON.stringify(queueToSave), {ex: 86400})

  // Setting the pending queue //
  const validPendingPairs: string[] = []
  if (currentPair) validPendingPairs.push(currentPair.pairId)
  initialQueue.forEach(q => validPendingPairs.push(q.pairId))
  await fast_db.set(`pending_queue:${code}:${sessionId}`, validPendingPairs, {ex: 86400})

  // Defining the number of the pairs //
  const itemsLength = await fast_db.zcard(`fast_ranking:${code}`)
  const numPairs = ((itemsLength) * ((itemsLength-1)/2))

  return <ClientPart 
    code={code}
    initialPair={currentPair}
    initialJackpot= {currentJackpot}
    numPairs={numPairs}
    initialQueue={initialQueue}
    initialJackpots={initialJackpots}
  />
}
