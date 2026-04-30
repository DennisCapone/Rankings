import { Redis } from '@upstash/redis'
export const fast_db = Redis.fromEnv()
