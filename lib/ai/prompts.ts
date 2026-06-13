import { getBlock, type Stage } from '@/lib/canvas-framework'

const STAGE_INSTRUCTION: Record<Stage, (evidence: string[]) => string> = {
  draft: () =>
    '【任務：起草】根據使用者的事業總述與這一格的問題，產出這一格的初稿。3–5 句、具體、可被質疑。只輸出初稿內容本身，不要客套或前言。',
  coach: () =>
    '【任務：教練】你是蘇格拉底式教練。一次只問 1–2 個追問，幫使用者把答案想得更具體、更有深度。不要替他回答，用對照好範例的方式點出落差，引導他自己補上證據。',
  devil: (evidence) =>
    `【任務：魔鬼代言人】你是挑剔的早期投資人。攻擊使用者的假設、戳破盲點，並要求以下這類數字與證據：${evidence.join('、')}。語氣犀利但有建設性，目的是讓商業模型禁得起挑戰，而不是打擊他。`,
}

export function buildSystemPrompt(blockNo: number, stage: Stage): string {
  const b = getBlock(blockNo)
  return [
    `你正在協助使用者完成「紀律創業畫布」（MIT Disciplined Entrepreneurship）的第 ${b.no} 格：${b.title}（${b.subtitle}）。`,
    `這一格在問：${b.question}`,
    `定義：${b.definition}`,
    `好範例：${b.goodExample}`,
    `壞範例：${b.badExample}`,
    '',
    STAGE_INSTRUCTION[stage](b.evidenceNeeded),
    '',
    '請全程使用繁體中文。',
  ].join('\n')
}

/**
 * 「整理成正式內容」用的 system prompt：
 * 讀完整對話（起草 / 教練 / 魔鬼代言人）與目前內容，產出這一格的「答案」本身，
 * 而非問題或挑戰。
 */
export function buildSynthesisPrompt(blockNo: number): string {
  const b = getBlock(blockNo)
  return [
    `你正在協助使用者完成「紀律創業畫布」（MIT Disciplined Entrepreneurship）的第 ${b.no} 格：${b.title}（${b.subtitle}）。`,
    `這一格在問：${b.question}`,
    `定義：${b.definition}`,
    `好範例：${b.goodExample}`,
    `壞範例：${b.badExample}`,
    '',
    '【任務：整理正式內容】根據使用者與教練 / 魔鬼代言人的完整對話，以及目前的內容，' +
      '產出這一格「正式內容」的更新版。要點：',
    '- 直接給出答案本身，吸收對話中被挑戰後該補強的具體細節與證據。',
    '- 3–5 句、具體、可驗證，向「好範例」的精神看齊；避免「壞範例」那種空泛說法。',
    '- 不要問問題、不要列出挑戰、不要客套或前言、不要解釋你做了什麼。',
    '- 只輸出這一格的正式內容文字本身。',
    '',
    '請全程使用繁體中文。',
  ].join('\n')
}
