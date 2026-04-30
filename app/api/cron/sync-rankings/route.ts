export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { syncAllRedisToDb } from '@/lib/sync'
 
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: 'Not allowed' },
        { status: 401 }
      )
    }
  }
 
  try {
    await syncAllRedisToDb()
    return NextResponse.json({ success: true, message: 'OK' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
