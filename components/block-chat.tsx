'use client'

import { useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import type { Stage } from '@/lib/canvas-framework'
import { AdoptButton } from '@/components/adopt-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type DbMsg = { id: string; stage: string; role: string; content: string }

function textOf(message: UIMessage): string {
  return message.parts.map((p) => (p.type === 'text' ? p.text : '')).join('')
}

const PLACEHOLDER: Record<Stage, string> = {
  draft: '描述你的事業 / 這一格的想法，讓 AI 產出初稿…',
  coach: '回答教練的追問，或丟出你目前的答案…',
  devil: '把你的假設丟上來，讓魔鬼代言人挑戰它…',
}

export function BlockChat({
  canvasId,
  blockNo,
  stage,
  onAdoptText,
}: {
  canvasId: string
  blockNo: number
  stage: Stage
  onAdoptText: (text: string) => void
}) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, setMessages } = useChat({
    id: `${canvasId}-${blockNo}-${stage}`,
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  // 載入該格、該階段的對話歷史。
  useEffect(() => {
    let active = true
    fetch(`/api/canvas/${canvasId}/messages?blockNo=${blockNo}`)
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d: { messages: DbMsg[] }) => {
        if (!active) return
        const history: UIMessage[] = d.messages
          .filter((m) => m.stage === stage)
          .map((m) => ({
            id: m.id,
            role: m.role === 'assistant' ? 'assistant' : 'user',
            parts: [{ type: 'text', text: m.content }],
          }))
        setMessages(history)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [canvasId, blockNo, stage, setMessages])

  const streaming = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto rounded-md border bg-muted/30 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">還沒有對話。輸入內容開始這一階段。</p>
        ) : (
          messages.map((m) => {
            const text = textOf(m)
            const isAssistant = m.role === 'assistant'
            return (
              <div key={m.id} className={isAssistant ? '' : 'text-right'}>
                <div
                  className={
                    isAssistant
                      ? 'inline-block rounded-lg bg-background px-3 py-2 text-sm whitespace-pre-wrap'
                      : 'inline-block rounded-lg bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground'
                  }
                >
                  {text}
                </div>
                {isAssistant && text.trim() && (
                  <div className="mt-1">
                    <AdoptButton onClick={() => onAdoptText(text.trim())} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim() || streaming) return
          sendMessage({ text: input }, { body: { canvasId, blockNo, stage } })
          setInput('')
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={PLACEHOLDER[stage]}
        />
        <Button type="submit" disabled={streaming || !input.trim()}>
          送出
        </Button>
      </form>
    </div>
  )
}
