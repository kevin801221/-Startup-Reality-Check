import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/lib/db/schema'

type DB = ReturnType<typeof drizzle<typeof schema>>

let _db: DB | undefined
let _client: ReturnType<typeof postgres> | undefined

/**
 * 取得（lazily 建立）Drizzle 連線。模組載入時不連線，第一次查詢才連，
 * 因此沒設 DATABASE_URL 時，光是 import 不會炸；呼叫到才會明確報錯。
 *
 * 走 Supabase Postgres pooler（transaction mode）時 `prepare: false`。
 */
export function getDb(): DB {
  if (_db) return _db
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL 未設定，無法連線資料庫（請填入 .env.local）')
  }
  _client = postgres(url, { prepare: false })
  _db = drizzle(_client, { schema })
  return _db
}
