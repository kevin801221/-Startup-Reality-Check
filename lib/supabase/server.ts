import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

/**
 * Server 端 Supabase client（Server Component / Route Handler / Server Action）。
 * 每次請求都新建，綁定當前請求的 cookies。
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // 從 Server Component 呼叫 setAll 會丟錯；可忽略，
            // session 的刷新交給 middleware 處理。
          }
        },
      },
    },
  )
}
