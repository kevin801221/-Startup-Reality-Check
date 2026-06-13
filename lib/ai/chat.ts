import { google } from '@ai-sdk/google'
import { streamText, type LanguageModel, type ModelMessage } from 'ai'
import { buildSystemPrompt } from '@/lib/ai/prompts'
import type { Stage } from '@/lib/canvas-framework'

export type StreamChatOptions = {
  blockNo: number
  stage: Stage
  messages: ModelMessage[]
  /** 預設用 Gemini 2.5 Flash；測試可注入 mock model。 */
  model?: LanguageModel
}

export function streamChat({ blockNo, stage, messages, model }: StreamChatOptions) {
  return streamText({
    model: model ?? google('gemini-2.5-flash'),
    system: buildSystemPrompt(blockNo, stage),
    messages,
  })
}
