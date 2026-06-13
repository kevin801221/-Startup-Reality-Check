import { convertToModelMessages, type UIMessage } from 'ai'
import { streamChat } from '@/lib/ai/chat'
import type { Stage } from '@/lib/canvas-framework'

export const maxDuration = 30

export async function POST(req: Request) {
  const { blockNo, stage, messages } = (await req.json()) as {
    blockNo: number
    stage: Stage
    messages: UIMessage[]
  }

  const result = streamChat({
    blockNo,
    stage,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
