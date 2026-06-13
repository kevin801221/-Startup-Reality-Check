'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    const mail = email.trim()
    if (!mail || !password) return
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password })
      if (error) throw error
      // 全頁導向，確保 server 端讀到剛寫入的 session cookie。
      window.location.assign('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '登入失敗，請確認帳密')
      setBusy(false)
    }
  }

  async function handleMagicLink() {
    const mail = email.trim()
    if (!mail) {
      toast.error('請先輸入 Email')
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: mail,
        options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard` },
      })
      if (error) throw error
      setSent(true)
      toast.success('登入連結已寄出，請至信箱點擊')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '寄送失敗，請稍後再試')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Canvas Coach</CardTitle>
          <CardDescription>紀律創業畫布 AI 教練。登入以管理你的事業畫布。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? '登入中…' : '登入'}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            或
            <span className="h-px flex-1 bg-border" />
          </div>

          {sent ? (
            <p className="text-sm text-muted-foreground">
              已寄出登入連結到 <span className="font-medium text-foreground">{email}</span>，
              點信中的連結即可登入。
            </p>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={busy}
              onClick={handleMagicLink}
            >
              改用 Email 連結登入（magic link）
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
