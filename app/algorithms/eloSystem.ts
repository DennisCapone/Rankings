'use server'
import { fast_db } from '@/lib/fast_db'
import { Session } from 'inspector'
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
  const [ pointsA, pointsB, iPointsA, iPointsB ] = await Promise.all([
    fast_db.zscore(`fast_ranking:${code}`, idA.toString()),
    fast_db.zscore(`fast_ranking:${code}`, idB.toString()),
    fast_db.zscore(`fast_ranking:${code}:${sessionId}`, idA.toString()) || 1000,
    fast_db.zscore(`fast_ranking:${code}:${sessionId}`, idB.toString()) || 1000
  ])
  if (pointsA === null || pointsB === null) return null
  if (iPointsA === null || iPointsB === null) return null

  // Elo algorithm //
  const expA = 1 / (1 + Math.pow(10, (pointsB - pointsA) / 400))
  const aInc = Math.round(aWinned ? sensibility * (1 - expA) : -sensibility * (expA))
  const iExpA = 1 / (1 + Math.pow(10, (iPointsB - iPointsA) / 400))
  const iAInc = Math.round(aWinned ? sensibility * (1 - iExpA) : -sensibility * (iExpA))

  // Update the points of the two players in Redis using a pipeline to ensure atomicity //
  const pipeline = fast_db.pipeline()
  pipeline.zincrby(`fast_ranking:${code}`, aInc, idA.toString())
  pipeline.zincrby(`fast_ranking:${code}`, -aInc, idB.toString())
  pipeline.zincrby(`fast_ranking:${code}:${sessionId}`, iAInc, idA.toString())
  pipeline.zincrby(`fast_ranking:${code}:${sessionId}`, -iAInc, idB.toString())
  pipeline.hincrby(`ranking:${code}`,'votes', 1)
  pipeline.expire(`fast_ranking:${code}`, 86400)
  pipeline.expire(`fast_ranking:${code}:${sessionId}`, 86400)
  await pipeline.exec()

  // Putting the pair in the drawned pairs and remove that from the pendings pair //
  await Promise.all ([
    fast_db.sadd(`drawned_pairs:${code}:${sessionId}`, pair.pairId, {ex:86400}),
    fast_db.lrem(`pending_queue:${code}:${sessionId}`, 0, pair.pairId)
  ]) 
}
