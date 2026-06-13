import { convertToModelMessages, type UIMessage } from 'ai'
import { streamChat } from '@/lib/ai/chat'
import type { Stage } from '@/lib/canvas-framework'
import { createClient } from '@/lib/supabase/server'
import { appendMessage, getCanvasWithBlocks } from '@/lib/db/queries'

export const maxDuration = 30

/** 從 UIMessage 取出純文字內容。 */
function textOf(message: UIMessage): string {
  return message.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('')
    .trim()
}

export async function POST(req: Request) {
  const { canvasId, blockNo, stage, messages } = (await req.json()) as {
    canvasId?: string
    blockNo: number
    stage: Stage
    messages: UIMessage[]
  }

  // 帶 canvasId 時才持久化：驗證登入 + 該畫布屬於本人（深度防禦，不只靠 RLS）。
  let persistCanvasId: string | undefined
  if (canvasId) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response('unauthorized', { status: 401 })
    }
    const owned = await getCanvasWithBlocks(canvasId, user.id)
    if (!owned) {
      return new Response('not found', { status: 404 })
    }
    persistCanvasId = canvasId

    // 先寫入這一輪使用者輸入（messages 內最後一則 user 訊息）。
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    const userText = lastUser ? textOf(lastUser) : ''
    if (userText) {
      await appendMessage({ canvasId, blockNo, stage, role: 'user', content: userText })
    }
  }

  const result = streamChat({
    blockNo,
    stage,
    messages: await convertToModelMessages(messages),
    onFinish: persistCanvasId
      ? async ({ text }) => {
          const trimmed = text.trim()
          if (trimmed) {
            await appendMessage({
              canvasId: persistCanvasId,
              blockNo,
              stage,
              role: 'assistant',
              content: trimmed,
            })
          }
        }
      : undefined,
  })

  return result.toUIMessageStreamResponse()
}
