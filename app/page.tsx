'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { CANVAS, type Stage } from '@/lib/canvas-framework'

export default function Home() {
  const [blockNo, setBlockNo] = useState(2)
  const [stage, setStage] = useState<Stage>('coach')
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const block = CANVAS.find((b) => b.no === blockNo)!

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui', padding: 16 }}>
      <h1>Canvas Coach — 串流驗證頁</h1>
      <p style={{ color: '#666' }}>（Plan 3 會換成真正的畫布 UI，這頁只為了戳通 Gemini）</p>

      <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
        <select value={blockNo} onChange={(e) => setBlockNo(Number(e.target.value))}>
          {CANVAS.map((b) => (
            <option key={b.no} value={b.no}>
              {b.no}. {b.title}（{b.subtitle}）
            </option>
          ))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
          <option value="draft">起草</option>
          <option value="coach">教練</option>
          <option value="devil">魔鬼代言人</option>
        </select>
      </div>

      <p style={{ background: '#f3f1eb', padding: 12, borderRadius: 8 }}>
        這一格在問：{block.question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <b>{m.role === 'user' ? '你' : 'AI'}：</b>
            {m.parts.map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : null))}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) return
          sendMessage({ text: input }, { body: { blockNo, stage } })
          setInput('')
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入你的想法，回答教練或挑你的魔鬼代言人…"
          style={{ flex: 1, padding: 10 }}
        />
        <button disabled={status === 'streaming'}>送出</button>
      </form>
    </main>
  )
}
