/**
 * 簡易的記憶體內 rate limiter（適合單一伺服器或開發環境）
 * 生產環境建議使用 Redis 或 Upstash Rate Limit
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 }, // 預設：每分鐘 10 次
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const record = store.get(identifier)

  if (!record || now >= record.resetAt) {
    const resetAt = now + config.windowMs
    store.set(identifier, { count: 1, resetAt })
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetAt,
    }
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetAt,
    }
  }

  record.count++
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetAt,
  }
}

// 定期清理過期記錄（避免記憶體洩漏）
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (now >= record.resetAt) {
        store.delete(key)
      }
    }
  }, 60_000) // 每分鐘清理一次
}

/**
 * 適用於 Next.js API routes 的 rate limit middleware
 * 
 * @example
 * ```ts
 * export async function POST(req: Request) {
 *   const rateLimitResult = await applyRateLimit(req, { maxRequests: 5, windowMs: 60_000 })
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { 
 *         status: 429,
 *         headers: {
 *           'X-RateLimit-Limit': rateLimitResult.limit.toString(),
 *           'X-RateLimit-Remaining': '0',
 *           'X-RateLimit-Reset': rateLimitResult.reset.toString(),
 *         }
 *       }
 *     )
 *   }
 *   // 繼續處理請求...
 * }
 * ```
 */
export async function applyRateLimit(
  req: Request,
  config?: RateLimitConfig,
) {
  // 使用 IP 作為識別（生產環境可能需要從 headers 取得真實 IP）
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown'
  
  return rateLimit(ip, config)
}
