import { CANVAS, type BlockSpec } from '@/lib/canvas-framework'
import { STATUS_META, STATUS_ORDER } from '@/lib/canvas/status'

/** 產出檔案的相對路徑（相對於 skill pack 目錄）與內容。 */
export type SkillFile = {
  path: string
  content: string
}

const GENERATED_NOTE =
  '<!-- 由 `pnpm skill:build` 從 lib/canvas-framework.ts 產生，請勿手動編輯 -->'

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

function circled(no: number): string {
  return CIRCLED[no - 1] ?? `${no}.`
}

function statusLadder(): string {
  return STATUS_ORDER.map((s) => `${STATUS_META[s].symbol} ${STATUS_META[s].label}`).join(' → ')
}

/**
 * SKILL.md：agent 執行「創業真心話」訪談的行為協議。
 * 只放協議與流程，10 格的方法論知識放在 references/canvas.md。
 */
export function renderSkillMd(blocks: BlockSpec[] = CANVAS): string {
  const toc = blocks
    .map((b) => `${circled(b.no)} ${b.title}（${b.subtitle}）`)
    .join('、')

  return `---
name: startup-reality-check
description: 用 MIT 紀律創業畫布的 10 格框架，對一個商業點子做三階段壓力測試（起草 → 教練追問 → 魔鬼代言人挑戰），並把結論寫成可驗證的文件。Use when the user wants to pressure-test a business idea, product direction, or startup plan; when they ask for a reality check, 創業真心話, 灘頭堡市場, beachhead market, unit economics, LTV/CAC, MVP 該先驗證什麼; or before building a product whose market assumptions have not been verified.
---
${GENERATED_NOTE}

# 創業真心話（Startup Reality Check）

對一個事業／產品點子做有紀律的壓力測試。你不是在陪使用者做夢，也不是要打擊他，而是要讓他的商業模型在真正花錢、花時間之前先被攻擊一次。

## 什麼時候用

- 使用者有一個新產品／新事業／新副專案的點子，還沒開始寫程式。
- 使用者已經在做了，但說不清楚客戶是誰、怎麼收費、為什麼是他能贏。
- 使用者要求「挑戰我」「潑我冷水」「不要只說好聽話」。

**不要用在**：純技術實作決策（該用 plan / 設計 review）、已經確定要做且只差執行的任務。

## 產出檔案

整場訪談的成果寫進 \`reality-check.md\`（若專案有 \`docs/\` 就放 \`docs/reality-check.md\`）。檔案已存在時讀它、接著往下做，不要重開一份。範本見 \`templates/reality-check.md\`。

每一格都記錄三件事：**正式內容**、**狀態燈**、**還缺的證據**。

## 10 格框架

${toc}

每一格的定義、好／壞範例、追問題庫、攻擊角度與所需證據，讀 \`references/canvas.md\`。**進入任何一格之前，先讀那一格的段落**，不要憑印象問。

## 三種模式

| 模式 | 你的角色 | 你要做的事 |
|------|----------|------------|
| **起草** | 快速共同創辦人 | 依使用者的一句話總述，產出 3–5 句具體、可被質疑的初稿。只給內容本身。 |
| **教練** | 蘇格拉底式引導者 | 一次只問 1–2 題，不替他回答。用「好範例」對照點出落差，讓他自己補上細節。 |
| **魔鬼代言人** | 挑剔的早期投資人 | 攻擊假設、要求數字與證據、指出他在迴避的問題。犀利但有建設性。 |

模式切換的預設順序是 起草 → 教練 → 魔鬼代言人。使用者若已有想法，跳過起草直接進教練。

## 執行流程

1. **拿到一句話總述。** 沒有的話，先問這一題：「這個事業用一句話講，是幫誰解決什麼？」
2. **一鍵起草 10 格。** 用總述把 10 格都填出初稿，全部標成 ${STATUS_META.draft.symbol} ${STATUS_META.draft.label}，寫進檔案。讓使用者一眼看到全貌與最弱的地方。
3. **排序。** 從最脆弱、最貴的假設開始，通常是 ${circled(2)} 灘頭堡市場、${circled(6)} 單位經濟、${circled(8)} 維持經濟。告訴使用者你要先打哪一格、為什麼。
4. **逐格訪談。** 一格一格做，一次只問一個問題。教練模式問完、內容補強後，切魔鬼代言人攻擊同一格。
5. **每格結束時更新檔案。** 改寫正式內容、更新狀態燈、列出還缺的證據。不要等到最後才寫。
6. **收尾。** 給三件事：最脆弱的三格、最貴的三個未驗證假設、接下來一週可以做的具體驗證動作（跟誰談、量什麼數字）。

## 狀態燈

${statusLadder()}

晉級條件（不要放水）：

- **${STATUS_META.empty.symbol} → ${STATUS_META.draft.symbol}**：有具體初稿，不是一句口號。
- **${STATUS_META.draft.symbol} → ${STATUS_META.refined.symbol}**：經過教練追問，內容已具體到可以被驗證（有對象、有數字、有場景）。
- **${STATUS_META.refined.symbol} → ${STATUS_META.challenged.symbol}**：經過魔鬼代言人攻擊，且該格「需要的證據」已有真實數據，或已有明確的驗證計畫（做什麼、跟誰、什麼時候、成功標準）。

**沒有證據就不能升到 ${STATUS_META.challenged.symbol}。** 使用者說「我覺得應該可以」不算證據。

## 鐵則

- **一次只問一個問題**，並附上你建議的答案，讓使用者可以只回「對」或直接修正。等他回答再問下一題。
- **能自己查的不要問。** 使用者的 repo、README、既有文件裡有答案，就自己去讀，只把「只有他知道的決定」留給他。
- **不要編數字。** 市場規模、CAC、成交週期，除非使用者提供或你有可引用的來源，否則寫成「待驗證」並說明怎麼驗證。編造出來的證據比空白更危險。
- **不要說好聽話。** 「這是個很棒的點子」對使用者沒有價值。指出哪裡不成立，並說清楚為什麼。
- **不准替使用者收斂到你喜歡的答案。** 決定是他的，你負責讓決定是清醒的。
- **抓「任何同業都能講」的句子。** 願景、價值主張、競爭優勢這幾格最常出現這種話，換成競爭對手的名字還成立，就代表那不是他的。

## 結束

當 10 格都到 ${STATUS_META.refined.symbol} 以上、且使用者確認沒有想迴避的問題時，停下來。把 \`reality-check.md\` 的最終版路徑告訴他，並明確說出「這份模型現在最可能錯的地方是哪一格」。

要接著把它變成規格、介面與可上線的產品，回到 [idea-to-ship](../idea-to-ship/SKILL.md) 這條流程。
`
}

/** references/canvas.md：10 格的完整方法論知識。 */
export function renderCanvasReference(blocks: BlockSpec[] = CANVAS): string {
  const sections = blocks.map((b) =>
    [
      `## ${circled(b.no)} ${b.title}（${b.subtitle}）`,
      '',
      `**這一格在問**：${b.question}`,
      '',
      `**定義**：${b.definition}`,
      '',
      `**好範例**：${b.goodExample}`,
      '',
      `**壞範例**：${b.badExample}`,
      '',
      '**教練追問（一次問 1–2 題）**',
      '',
      ...b.coachQuestions.map((q) => `- ${q}`),
      '',
      '**魔鬼代言人的攻擊角度**',
      '',
      ...b.devilAngles.map((a) => `- ${a}`),
      '',
      `**需要的證據（沒有這些就不能算「${STATUS_META.challenged.label}」）**`,
      '',
      ...b.evidenceNeeded.map((e) => `- ${e}`),
    ].join('\n'),
  )

  return [
    GENERATED_NOTE,
    '',
    '# 10 格方法論知識',
    '',
    '出自 Bill Aulet《Disciplined Entrepreneurship》（MIT）的紀律創業畫布。進入某一格之前先讀該格段落，再開始問。',
    '',
    ...sections.flatMap((s) => [s, '']),
  ]
    .join('\n')
    .trimEnd()
    .concat('\n')
}

/** templates/reality-check.md：訪談成果的工作檔案範本。 */
export function renderCanvasTemplate(blocks: BlockSpec[] = CANVAS): string {
  const sections = blocks.map((b) =>
    [
      `## ${circled(b.no)} ${b.title}（${b.subtitle}） ${STATUS_META.empty.symbol} ${STATUS_META.empty.label}`,
      '',
      `*這一格在問：${b.question}*`,
      '',
      '（尚未填寫）',
      '',
      '**還缺的證據**：待訪談',
    ].join('\n'),
  )

  return [
    '# <事業名稱>｜創業真心話',
    '',
    '> 一句話總述：<幫誰解決什麼>',
    '',
    `狀態燈：${statusLadder()}`,
    '',
    ...sections.flatMap((s) => [s, '']),
  ]
    .join('\n')
    .trimEnd()
    .concat('\n')
}

/** 完整 skill pack 的檔案清單。 */
export function buildSkillPack(blocks: BlockSpec[] = CANVAS): SkillFile[] {
  return [
    { path: 'SKILL.md', content: renderSkillMd(blocks) },
    { path: 'references/canvas.md', content: renderCanvasReference(blocks) },
    { path: 'templates/reality-check.md', content: renderCanvasTemplate(blocks) },
  ]
}
