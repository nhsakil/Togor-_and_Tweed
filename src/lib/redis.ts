import { Redis } from '@upstash/redis'

const globalForRedis = globalThis as unknown as { redis: Redis | null | undefined }

function createRedis(): Redis | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    return new Redis({ url, token })
  } catch {
    return null
  }
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined
    ? globalForRedis.redis
    : (globalForRedis.redis = createRedis())

export default redis
