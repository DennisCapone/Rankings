'use server'
import { fast_db } from '@/lib/fast_db'
import { SRemCommand } from '@upstash/redis'
import { cookies } from 'next/headers'

export async function eloSystem(code: string, token: string, aWinned: boolean) {
  const sensibility = 100  // Sensibility factor of the elo system //

  // Take the session id //
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session')?.value


  // Taking the ids from Redis
  const pair = await fast_db.hgetall(`token:${token}`)
  fast_db.del(`token:${token}`)
  if (!pair || !pair.idA || !pair.idB) {
    throw new Error('token error in EloSystem')
  }
  const idA = pair.idA
  const idB = pair.idB

  if (idA == null || idB == null) return null

  // Fetch the current pair of players from Redis and their points //
  const [ pointsA, pointsB] = await Promise.all([
    fast_db.zscore(`fast_ranking:${code}`, idA.toString()),
    fast_db.zscore(`fast_ranking:${code}`, idB.toString())
  ])
  if (pointsA === null || pointsB === null) throw new Error('Player not found in the ranking')

  const pendingPairs = await fast_db.get<string[]>(`pending_queue:${code}:${sessionId}`) || []
  const updatedPendingPairs = pendingPairs.filter((id) => id !== pair.pairId)
 
  // Elo algorithm //
  const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))
  const aInc = Math.round(aWinned ? sensibility * (1 - expA) : -sensibility * (expA))

  // Update the points of the two players in Redis using a pipeline to ensure atomicity //
  const pipeline = fast_db.pipeline()
  pipeline.zincrby(`fast_ranking:${code}`, aInc, idA.toString())
  pipeline.zincrby(`fast_ranking:${code}`, -aInc, idB.toString())
  await pipeline.exec()

  // Putting the pair in the drawned pairs and remove that from the pendings pair //
  await Promise.all ([
    fast_db.sadd(`drawn_pairs:${code}:${sessionId}`, pair.pairId),
    fast_db.set(`pending_queue:${code}:${sessionId}`, updatedPendingPairs)
  ]) 
}
