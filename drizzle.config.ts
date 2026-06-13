import { defineConfig } from 'drizzle-kit'

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
