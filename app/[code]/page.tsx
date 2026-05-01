import ClientPart from '@/app/[code]/clientPart'
import { fast_db } from '@/lib/fast_db'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { drawing, Pair } from '../algorithms/drawings'

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Checking for the code and for the session //
  const { code } = await params
  if (code.length !== 8 && code !== 'PONTECCHIO') notFound()
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value || ''

  // Calling the initial queue (10 elements) to prefetch it in background //
  const pendingsIds = await fast_db.lrange(`pending_queue:${code}:${sessionId}`, 0, -1)  
  const needed = 9 - pendingsIds.length
  for (let i = 0; i < needed; i++) {
    await drawing(code)
  }

  // Setting the pending queue //
  const pendingsQueue: Pair[] = await Promise.all(
    pendingsIds.map(async (pairId): Promise<Pair> => {
      const data = await fast_db.hgetall(`pairs:${pairId}`)
      if (!data) {
        throw new Error(`No data: ${pairId}`);
      }
      return {
        i1: {
          id: Number(data.i1_id),
          name: String(data.i1_name),
          score: Number(data.i1_score)
        },
        i2: {
          id: Number(data.i2_id),
          name: String(data.i2_name),
          score: Number(data.i2_score)
        },
        diff: Number(data.diff),
        pairId: String(data.pairId),
        token: String(data.token),
        jackpot: data.jackpot !== 'f'
        }
    })
  )

  // Defining the number of the pairs //
  const itemsLength = await fast_db.zcard(`fast_ranking:${code}`)
  const numPairs = ((itemsLength) * ((itemsLength-1)/2))

  return <ClientPart 
    code = { code }
    startingQueue = { pendingsQueue }
    numPairs = { numPairs }
  />
}
