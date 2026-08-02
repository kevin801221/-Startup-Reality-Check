# 效能優化指南

本文檔說明已實施和建議的效能優化措施。

## 已實施的優化

### 1. Next.js 配置優化

#### Bundle 優化
```typescript
// next.config.ts
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog'],
}
```
- 自動優化大型套件的導入
- 減少 bundle size

#### Code Splitting
```typescript
webpack: (config) => {
  config.optimization.splitChunks = {
    cacheGroups: {
      vendor: { /* 第三方套件 */ },
      react: { /* React 相關 */ },
      ai: { /* AI SDK */ },
    }
  }
}
```
- 將不同類型的程式碼分離
- 提高快取效率

#### 圖片優化
```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天
}
```
- 自動轉換為現代格式
- 延長快取時間

### 2. 安全性 Headers
```typescript
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
]
```

### 3. API 工具

#### 錯誤處理
```typescript
import { handleApiError, ApiError } from '@/lib/api/error-handler'

export async function GET(req: Request) {
  try {
    // 處理邏輯
    throw new ApiError('Not found', 404, 'NOT_FOUND')
  } catch (error) {
    return handleApiError(error)
  }
}
```

#### 身份驗證
```typescript
import { requireAuth } from '@/lib/api/auth'

export async function POST(req: Request) {
  const user = await requireAuth() // 自動拋出 401 錯誤
  // 繼續處理...
}
```

#### Rate Limiting
```typescript
import { applyRateLimit } from '@/lib/api/rate-limit'

export async function POST(req: Request) {
  const rateLimitResult = await applyRateLimit(req, { 
    maxRequests: 10, 
    windowMs: 60_000 
  })
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  // 繼續處理...
}
```

#### 結構化日誌
```typescript
import { logger, createApiTimer } from '@/lib/api/logger'

export async function GET(req: Request) {
  const timer = createApiTimer()
  logger.apiRequest('GET', '/api/canvas')
  
  // 處理邏輯...
  
  logger.apiResponse('GET', '/api/canvas', 200, timer.end())
}
```

## 建議的優化措施

### 1. 資料庫連線池優化

#### Supabase Pooler（推薦）
```env
# 使用 Supabase 的連線池模式
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

優點：
- 自動管理連線池
- 支援 serverless 環境
- 無需額外配置

#### Drizzle 連線池配置
```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const client = postgres(process.env.DATABASE_URL!, {
  max: 10, // 最大連線數
  idle_timeout: 20, // 閒置超時（秒）
  connect_timeout: 10, // 連線超時（秒）
})

export const db = drizzle(client)
```

### 2. API 快取策略

#### React Server Components 快取
```typescript
// app/dashboard/page.tsx
export const revalidate = 60 // 60 秒重新驗證

export default async function DashboardPage() {
  const canvases = await listCanvases(userId)
  // ...
}
```

#### Next.js Data Cache
```typescript
// lib/db/queries.ts
export async function listCanvases(userId: string) {
  return fetch(`/api/canvas?userId=${userId}`, {
    next: { 
      revalidate: 60, // 60 秒快取
      tags: ['canvases', userId] 
    }
  })
}

// 手動清除快取
import { revalidateTag } from 'next/cache'
revalidateTag('canvases')
```

### 3. 資料庫查詢優化

#### 添加索引
```sql
-- drizzle/migrations/add_indexes.sql
CREATE INDEX idx_canvases_user_updated 
ON canvases(user_id, updated_at DESC);

CREATE INDEX idx_blocks_canvas 
ON blocks(canvas_id, block_no);

CREATE INDEX idx_messages_canvas_block 
ON messages(canvas_id, block_no, created_at);
```

#### 查詢優化
```typescript
// 使用 select 減少傳輸資料量
const canvases = await db
  .select({
    id: canvases.id,
    title: canvases.title,
    updatedAt: canvases.updatedAt,
  })
  .from(canvases)
  .where(eq(canvases.userId, userId))
```

### 4. AI API 優化

#### 請求快取（適用於重複查詢）
```typescript
// lib/ai/cache.ts
const cache = new Map<string, { data: string; expiresAt: number }>()

export function getCachedResponse(key: string) {
  const cached = cache.get(key)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data
  }
  return null
}

export function setCachedResponse(key: string, data: string, ttl: number = 3600000) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  })
}
```

#### 串流優化
```typescript
// 已實施在 lib/ai/chat.ts
export function streamChat(options) {
  return streamText({
    model,
    messages,
    maxTokens: 1000, // 限制 token 數量
    temperature: 0.7,
  })
}
```

### 5. 前端效能優化

#### 動態導入
```typescript
// 延遲載入大型組件
const BlockPanel = dynamic(() => import('@/components/block-panel'), {
  loading: () => <Skeleton />,
  ssr: false, // 客戶端渲染
})
```

#### React 優化
```typescript
// 使用 useMemo 和 useCallback
const memoizedBlocks = useMemo(() => {
  return blocks.filter(b => b.status !== 'empty')
}, [blocks])

const handleClick = useCallback(() => {
  // 處理點擊
}, [dependencies])
```

#### 虛擬化長列表
```typescript
// 如果訊息列表很長，使用 react-virtual
import { useVirtualizer } from '@tanstack/react-virtual'

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100,
})
```

### 6. 監控與分析

#### Vercel Analytics（推薦）
```bash
pnpm add @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Sentry 錯誤追蹤
```bash
pnpm add @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

### 7. 成本優化

#### AI API 成本控制
```typescript
// 限制每日請求次數
const DAILY_LIMIT = 1000

export async function checkDailyLimit(userId: string) {
  const count = await redis.get(`ai:${userId}:${today}`)
  if (count && parseInt(count) >= DAILY_LIMIT) {
    throw new ApiError('Daily limit reached', 429)
  }
}
```

#### 資料庫成本
- 定期清理舊訊息（保留最近 1000 筆）
- 壓縮或歸檔不活躍的畫布

## 效能檢查清單

- [ ] 啟用 Next.js production build
- [ ] 使用 Supabase connection pooler
- [ ] 添加適當的資料庫索引
- [ ] 實施 API rate limiting
- [ ] 配置 CDN 和 edge caching
- [ ] 監控 Core Web Vitals
- [ ] 設定錯誤追蹤
- [ ] 優化圖片和字體載入
- [ ] 實施程式碼分割
- [ ] 設定效能預算

## 效能測試

### Lighthouse CI
```bash
# 本地測試
pnpm build
pnpm start
npx lighthouse http://localhost:3000 --view
```

### Load Testing
```bash
# 使用 k6 進行負載測試
k6 run load-test.js
```

## 資源

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Vercel Edge Config](https://vercel.com/docs/storage/edge-config)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- [React Performance](https://react.dev/learn/render-and-commit)
