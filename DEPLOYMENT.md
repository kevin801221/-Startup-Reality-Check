# 部署指南 Deployment Guide

本文檔說明如何將「創業真心話」部署到各種平台。

## Vercel 部署（推薦）

### 一鍵部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kevin801221/-Startup-Reality-Check)

### 手動部署步驟

1. **Fork 或 Clone 此倉庫**

2. **在 Vercel 建立新專案**
   - 連結你的 GitHub 帳號
   - 選擇此倉庫
   - Framework Preset 會自動識別為 Next.js

3. **設定環境變數**

在 Vercel 專案設定中添加以下環境變數：

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

4. **部署**
   - 點擊「Deploy」按鈕
   - Vercel 會自動建置並部署應用程式

5. **設定 Supabase Redirect URLs**

在 Supabase Dashboard：
- Authentication > URL Configuration > Redirect URLs
- 添加你的 Vercel 域名：`https://your-app.vercel.app/auth/confirm`

### 環境變數說明

| 變數名稱 | 說明 | 如何取得 |
|---------|------|---------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API 金鑰 | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名金鑰 | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 服務金鑰（僅伺服器端） | Supabase Dashboard > Settings > API |
| `DATABASE_URL` | PostgreSQL 連線字串 | Supabase Dashboard > Settings > Database > Connection Pooling |

## 自託管部署（Docker）

### 使用 Docker Compose

1. **建立 `.env` 檔案**

```bash
cp .env.local.example .env
# 編輯 .env 並填入真實的環境變數
```

2. **建立 `docker-compose.yml`**

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

3. **建立 `Dockerfile`**

```dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

4. **啟動容器**

```bash
docker-compose up -d
```

## 資料庫遷移

部署後首次啟動時，需要執行資料庫遷移：

```bash
pnpm db:migrate
```

或透過 Supabase SQL Editor 手動執行 `drizzle` 資料夾中的 SQL 檔案。

## 效能優化建議

### 1. 啟用 CDN
- Vercel 預設已啟用全球 CDN
- 靜態資源自動快取

### 2. 設定正確的快取標頭
應用程式已在 `next.config.ts` 中設定：
- 靜態資源：30 天快取
- API 路由：no-cache

### 3. 資料庫連線池
使用 Supabase Pooler 或 PgBouncer：
```bash
DATABASE_URL=postgresql://postgres.xxx:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 4. 監控與日誌
- 使用 Vercel Analytics 監控效能
- 考慮添加 Sentry 進行錯誤追蹤

## CI/CD

本專案已配置 GitHub Actions：
- 自動執行 lint、type check 和測試
- PR 時自動建置檢查
- 可擴展自動部署到 Vercel

詳見 `.github/workflows/ci.yml`

## 疑難排解

### 建置失敗
- 確認所有環境變數都已正確設定
- 檢查 Node.js 版本（需要 20+）
- 確認 pnpm 版本（需要 9+）

### 資料庫連線錯誤
- 確認 DATABASE_URL 格式正確
- 檢查 Supabase 專案是否啟用連線池
- 驗證 IP 白名單設定（某些主機商需要）

### Supabase Auth 問題
- 確認 Redirect URLs 包含你的部署域名
- 檢查 Email Auth provider 是否已啟用
- 驗證 CORS 設定

## 擴展性考量

- **水平擴展**：應用程式設計為無狀態，可輕鬆水平擴展
- **資料庫擴展**：考慮使用 Supabase Pro 計劃以獲得更好的效能
- **API 限速**：建議在生產環境添加 rate limiting
- **成本優化**：監控 Gemini API 使用量，考慮實作請求快取

## 安全性檢查清單

- [ ] 所有環境變數都使用安全的 secrets 管理
- [ ] 資料庫啟用 Row-Level Security (RLS)
- [ ] API 路由有適當的身份驗證檢查
- [ ] 啟用 HTTPS（Vercel 預設啟用）
- [ ] 設定正確的 CORS 和 CSP headers
- [ ] 定期更新依賴套件
- [ ] 啟用 Supabase 的 realtime security rules

## 支援

如有部署問題，請：
1. 查閱 [Next.js 官方文檔](https://nextjs.org/docs/deployment)
2. 查閱 [Supabase 官方文檔](https://supabase.com/docs)
3. 在 GitHub Issues 中提問
