import { google } from '@ai-sdk/google'
import { generateText, type LanguageModel, type ModelMessage } from 'ai'
import { buildSynthesisPrompt } from '@/lib/ai/prompts'

export type SynthesizeOptions = {
  blockNo: number
  /** 該格目前的正式內容（可能為空）。 */
  currentContent: string
  /** 該格的完整對話（起草 / 教練 / 魔鬼代言人，依時間排序）。 */
  messages: ModelMessage[]
  /** 預設用 Gemini 2.5 Flash；測試可注入 mock model。 */
  model?: LanguageModel
}

/**
 * 把「目前內容 + 整段對話」交給模型，產出更新後的「正式內容」（答案本身，非問題）。
 * 非串流：一次回傳整理好的文字，前端填入可編輯區供使用者確認後儲存。
 */
export async function synthesizeContent({
  blockNo,
  currentContent,
  messages,
  model,
}: SynthesizeOptions): Promise<string> {
  const { text } = await generateText({
    model: model ?? google('gemini-2.5-flash'),
    system: buildSynthesisPrompt(blockNo),
    messages: [
      ...messages,
      {
        role: 'user',
        content: `這一格目前的正式內容如下（可能為空）：\n${
          currentContent.trim() || '（空）'
        }\n\n請依上面的完整討論，輸出更新後的正式內容。`,
      },
    ],
  })
  return text.trim()
}
