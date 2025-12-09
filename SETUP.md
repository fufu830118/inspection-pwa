# 巡檢系統 PWA - 快速設定指南

## 📋 前置需求

- Node.js 18+
- npm 或 yarn
- Supabase 帳號
- Wiwynn OAuth 權限

## 🚀 快速開始

### 步驟 1: 安裝依賴

```bash
cd inspection-pwa
npm install
```

### 步驟 2: 設定 Supabase

#### 2.1 建立 Supabase 專案
1. 前往 https://supabase.com/dashboard
2. 建立新專案（建議選擇 Singapore 區域）
3. 等待專案建立完成（約 2-3 分鐘）

#### 2.2 執行資料庫 Schema
1. 在 Supabase Dashboard，點擊「SQL Editor」
2. 複製 `supabase/schema.sql` 的內容
3. 貼上並執行
4. 確認執行成功（應該看到 3 個資料表建立成功）

#### 2.3 配置環境變數
1. 複製環境變數範本：
   ```bash
   cp .env.example .env
   ```

2. 在 Supabase Dashboard：
   - 點擊「Project Settings」→「API」
   - 複製 `Project URL` 和 `anon public key`

3. 編輯 `.env` 檔案：
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```

### 步驟 3: 設定 OAuth

#### 3.1 註冊 Redirect URI
在 Wiwynn OAuth Portal 註冊以下 URI：
- 開發環境：`http://localhost:5173/auth/callback`
- 生產環境：`https://your-domain.com/auth/callback`

#### 3.2 檢查 OAuth 配置
打開 `src/config/oauth.js`，確認：
- `CLIENT_ID` 和 `CLIENT_SECRET` 正確
- `REDIRECT_URI` 符合註冊的 URI

### 步驟 4: 啟動開發伺服器

```bash
npm run dev
```

瀏覽器會自動開啟 `http://localhost:5173`

### 步驟 5: 測試功能

#### 5.1 測試登入
1. 點擊「登入」按鈕
2. 使用 Wiwynn 員工帳號登入
3. 應該會導向首頁並顯示使用者名稱

#### 5.2 測試掃碼
1. 點擊底部「掃碼」按鈕
2. 允許相機權限
3. 掃描設備 QR Code（或點擊「手動輸入」測試）
4. 輸入測試編號如：`FIRE-001`
5. 應該會開啟滅火器檢查表單

#### 5.3 測試表單提交
1. 填寫檢查表單
2. 點擊「完成檢查」
3. 應該會看到成功訊息並導向首頁

#### 5.4 測試歷史紀錄
1. 點擊底部「紀錄」按鈕
2. 應該會看到剛才提交的檢查紀錄
3. 點擊匯出按鈕測試 CSV 下載

## 📱 部署到生產環境

### 選項 1: Vercel (推薦)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入
vercel login

# 部署
vercel

# 設定環境變數
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 重新部署
vercel --prod
```

### 選項 2: Netlify

1. 在 Netlify Dashboard 建立新網站
2. 連接 Git repository
3. 設定建置命令：`npm run build`
4. 設定發布目錄：`dist`
5. 新增環境變數：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. 部署

### 選項 3: 自建伺服器

```bash
# 建置生產版本
npm run build

# 建置結果在 dist/ 目錄
# 將 dist/ 部署到任何靜態網站伺服器（Nginx, Apache, etc.）
```

## 🔧 常見問題

### Q: OAuth 登入後顯示 "Invalid redirect_uri"
**A:** 確認 `src/config/oauth.js` 中的 `REDIRECT_URI` 已在 Wiwynn OAuth Portal 註冊。

### Q: 相機無法啟動
**A:**
- 確保使用 HTTPS（生產環境）或 localhost（開發環境）
- 檢查瀏覽器相機權限設定
- iOS Safari 需要使用者手動點擊按鈕才能啟動相機

### Q: Supabase 連線失敗
**A:**
- 檢查 `.env` 檔案是否正確
- 確認 Supabase 專案狀態正常
- 檢查 RLS (Row Level Security) 政策是否已設定

### Q: 掃碼後無法識別設備
**A:**
- 確認 QR Code 格式為 `PREFIX-ID`（例如：`FIRE-001`）
- 檢查前綴是否與 `categories.js` 中的 `id_prefix` 對應
- 可使用手動輸入功能測試

## 📊 資料匯入

### 從 CSV 匯入設備清單

目前系統使用靜態類別配置，設備清單可透過 Supabase 手動匯入：

1. 在 Supabase Dashboard，點擊「Table Editor」
2. 選擇 `equipment` 資料表
3. 點擊「Insert」→「Import data from CSV」
4. 選擇您的設備 CSV 檔案（例如：`滅火器清單.csv`）
5. 對應欄位：
   - `equipment_id` ← 設備編號
   - `category_id` ← 從 `inspection_categories` 查詢對應的 UUID
   - `location` ← 位置
   - `is_active` ← true

## 🎯 下一步

完成基本設定後，您可以：

1. 自訂檢查類別（編輯 `src/stores/categories.js`）
2. 調整表單欄位（修改 `form_config`）
3. 整合 Supabase 實際儲存（目前使用 localStorage）
4. 新增照片上傳功能
5. 實作 Service Worker 離線支援
6. 建立統計報表頁面

## 📞 支援

如有問題，請聯絡：
- Email: michael.wang@wiwynn.com
- 內部 Slack: #inspection-system
