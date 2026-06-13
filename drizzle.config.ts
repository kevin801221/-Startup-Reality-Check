import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// drizzle-kit CLI 不會自動載入 .env.local，這裡手動載入（.env.local 優先）。
config({ path: ['.env.local', '.env'] })

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // 僅 `drizzle-kit migrate / push` 需要連線；`generate` 離線即可。
    url: process.env.DATABASE_URL ?? '',
  },
  // 不要動 Supabase 內建 schema（auth 等）
  schemaFilter: ['public'],
})
