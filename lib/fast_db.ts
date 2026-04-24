import { Redis } from '@upstash/redis'
export const fast_db = Redis.fromEnv()
await fast_db.set("foo", "bar");
await fast_db.get("foo");