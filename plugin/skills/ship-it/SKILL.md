---
name: ship-it
description: 上線前的 preflight 與部署：跑完 lint／typecheck／測試／build，檢查環境變數與 migration，部署後對真實 URL 做 smoke check，並記錄部署內容與回滾步驟。Use when the user says 部署, 上線, deploy, ship it, 發布, preflight, or as stage 8 of the idea-to-ship pipeline after the slices are built.
---

# 上線

部署本身通常只是一個指令，會出事的是**部署前沒檢查的東西**與**部署後沒驗證的東西**。這一階段負責這兩端。

輸出到 `docs/ship/<YYYY-MM-DD>-<slug>.md`，範本見 `templates/ship.md`。

## Preflight

全部通過才准部署，任何一項失敗就停下來修：

1. **程式碼檢查**：lint、typecheck、測試、build 全綠。跑的是完整套件，不是只跑你改的那幾個檔。
2. **環境變數**：列出這次新增或改變的變數，確認目標環境（preview／production）真的有設。少一個 key 的失敗會在使用者身上出現，不會在你這裡。
3. **Migration**：有 schema 變更時確認 migration 檔已產生並在乾淨環境跑過一次；寫下回滾方式。**對 production 資料庫執行 migration 前一定要停下來取得明確同意**，不要在自動模式下自己跑。
4. **相容性**：這次改動會不會弄壞正在使用的人？舊版前端配新版 API 會不會爆？需要的話分兩次部署（先後端相容、再前端）。
5. **不可逆副作用**：會不會寄信給真實使用者、扣款、發推、覆寫既有資料？有的話停下來確認。
6. **回滾計畫**：怎麼退回上一版、資料要不要一起退、退回的指令是什麼。沒有回滾計畫就不算準備好。

## 部署

- **先確認這個專案怎麼部署**：讀 README、CI 設定、既有 workflow。有既有流程就照走，不要自己發明。
- **能先上 preview／staging 就先上。** 在真實 URL 上跑一遍再推 production。
- **不要自己開啟付費資源或建立新的雲端專案**，那要使用者決定。
- 部署過程失敗時，把錯誤訊息完整貼出來再判斷，不要重試三次然後說「應該是暫時的」。

## 部署後驗證

- 打開真實 URL，照 spec 的主要驗收條件手動走一遍（至少 happy path 加一個錯誤路徑）。
- 看一眼錯誤記錄與部署 log，確認沒有一波新的錯誤。
- 確認新的環境變數與 migration 真的生效（不是靠假設，是靠看到結果）。
- 有指標的話記下部署前後的基準值。

## 收尾

在 `docs/ship/` 記錄：版本／commit、部署到哪、包含哪些 US、跑了哪些 migration、環境變數變更、驗證結果、回滾步驟、以及**已知還沒解決的問題**。

回報使用者：URL、驗證了什麼、還有什麼沒驗證、以及如果要回滾該執行什麼。

最後把 pipeline 狀態檔（`docs/pipeline/<slug>.md`）標成 shipped，並把「還沒驗證的假設」搬到下一輪的待辦。整條流程見 [idea-to-ship](../idea-to-ship/SKILL.md)。
