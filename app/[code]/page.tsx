import ClientPart from '@/app/[code]/clientPart'
import { drawing } from '@/app/algorithms/drawings'
import { fast_db } from '@/lib/fast_db'
import { Pair } from '@/app/algorithms/drawings'

export default async function Play({ params }: { params: Promise<{ code: string }> }) {
  // Call all the client part from another component to be able to prefetche data and avoid loading times //
  const { code } = await params
  
  // Calling the first question //
  const first = await drawing(code)
  if (!first) return null
  const [ initialPlayer ] = first

  // Calling the initial queue (9 elements) to prefetch it in background //
  const initialQueue: Pair[] = []
  const initialJackpots: boolean[] = []
  for (let i = 0; i < 9; i++) {
    const result = await drawing(code)
    if (!result) break
    const [ queue, jackpot ] = result
    initialQueue.push(queue)
    initialJackpots.push(jackpot)
  }

  // Defining the number of the pairs //
  const itemsLength = await fast_db.hlen(`fast_ranking:${code}`)
  const numPairs = ((itemsLength) * ((itemsLength-1)/2))

  return <ClientPart code={code} initialPlayer={initialPlayer} numPairs={numPairs} initialQueue={initialQueue} initialJackpots={initialJackpots} />
}
