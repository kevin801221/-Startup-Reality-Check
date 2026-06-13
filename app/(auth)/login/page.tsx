'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setSending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      })
      if (error) throw error
      setSent(true)
      toast.success('登入連結已寄出，請至信箱點擊')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '寄送失敗，請稍後再試')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Canvas Coach</CardTitle>
          <CardDescription>
            紀律創業畫布 AI 教練。輸入 Email，我們寄一條免密碼登入連結給你。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm text-muted-foreground">
              已寄出登入連結到 <span className="font-medium text-foreground">{email}</span>，
              點擊信中的連結即可登入。沒收到的話檢查垃圾信匣，或重新整理此頁再試一次。
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <Button type="submit" disabled={sending}>
                {sending ? '寄送中…' : '寄送登入連結'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
