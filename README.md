# 巡檢系統 PWA - Wiwynn Inspection System

## 📱 專案概述

這是一個專為手機瀏覽器設計的通用型巡檢 PWA 應用程式，支援多種設備類別的巡檢作業。

### 主要特色

- 📱 **Mobile-First 設計** - 採用底部導航欄，觸控友善
- 🔐 **Wiwynn OAuth 認證** - 使用公司內部 OAuth 系統
- 📷 **QR Code 掃碼** - 快速識別設備並開啟對應表單
- 📊 **動態表單系統** - 根據設備類別自動載入檢查項目
- 💾 **Supabase 後端** - 雲端資料庫儲存
- 📤 **CSV 匯出** - 支援匯出檢查紀錄
- 🔌 **離線支援** - PWA 可安裝到手機主畫面

## 🏗️ 技術架構

### 前端
- **Vue 3** - Composition API
- **Vite** - 開發工具
- **Tailwind CSS** - Mobile-First 樣式
- **Pinia** - 狀態管理
- **Vue Router** - 路由管理
- **html5-qrcode** - QR Code 掃描

### 後端
- **Supabase** - PostgreSQL 資料庫 + Auth
- **Wiwynn OAuth** - SSO 認證整合

## 📂 專案結構

```
inspection-pwa/
├── public/
│   ├── manifest.json          # PWA 配置
│   ├── icon-192.png          # App 圖示
│   └── icon-512.png
├── src/
│   ├── components/           # Vue 組件
│   │   ├── BottomNav.vue    # 底部導航欄
│   │   ├── CategoryCard.vue # 類別卡片
│   │   └── Scanner.vue      # QR Code 掃描器
│   ├── views/               # 頁面組件
│   │   ├── Home.vue         # 首頁(類別列表)
│   │   ├── Scan.vue         # 掃碼頁面
│   │   ├── History.vue      # 歷史紀錄
│   │   ├── InspectionForm.vue # 檢查表單
│   │   ├── Login.vue        # 登入頁
│   │   └── AuthCallback.vue # OAuth 回調
│   ├── stores/              # Pinia Stores
│   │   ├── auth.js          # 認證狀態
│   │   ├── inspection.js    # 巡檢資料
│   │   └── categories.js    # 類別管理
│   ├── composables/         # Composable 函數
│   │   ├── useQRScanner.js  # QR 掃描邏輯
│   │   └── useOAuth.js      # OAuth 邏輯
│   ├── utils/               # 工具函數
│   │   ├── csv.js           # CSV 匯出
│   │   └── api.js           # API 請求
│   ├── config/              # 配置
│   │   ├── oauth.js         # OAuth 配置
│   │   └── supabase.js      # Supabase 配置
│   ├── router/              # 路由配置
│   │   └── index.js
│   ├── App.vue              # 根組件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局樣式
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🎯 核心功能

### 1. OAuth 認證流程
1. 用戶點擊「登入」
2. 導向 Wiwynn OAuth 頁面
3. 使用員工帳號登入
4. 回調到應用，獲取 access token
5. 儲存用戶資訊到 Pinia store

### 2. QR Code 掃描流程
1. 用戶點擊底部「掃碼」按鈕
2. 開啟相機
3. 掃描 QR Code（例如：`FIRE-A23A1-01-1`）
4. 系統識別設備類別前綴（`FIRE` = 滅火器）
5. 自動跳轉到對應的檢查表單

### 3. 動態表單系統
- 根據設備類別從 `inspection_categories` 表載入 `form_config`
- 動態渲染檢查項目（checkbox, radio, text, date）
- 表單驗證
- 提交到 `inspection_logs` 表

### 4. 資料庫架構

#### inspection_categories (檢查類別表)
```sql
CREATE TABLE inspection_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,        -- 例如：滅火器
  id_prefix VARCHAR(10) NOT NULL,    -- 例如：FIRE
  icon VARCHAR(50),                   -- 圖示名稱
  frequency VARCHAR(50),              -- 檢查頻率：每月/每季/每半年
  form_config JSONB NOT NULL,         -- 表單配置
  created_at TIMESTAMP DEFAULT NOW()
);

-- form_config 範例：
{
  "fields": [
    {
      "id": "appearance",
      "label": "瓶身外觀是否無鏽蝕狀況",
      "type": "checkbox",
      "required": true
    },
    {
      "id": "pressure",
      "label": "壓力指示值是否在有效範圍(綠色)內",
      "type": "checkbox",
      "required": true
    }
  ]
}
```

#### equipment_list (設備清單)
```sql
CREATE TABLE equipment_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES inspection_categories(id),
  equipment_id VARCHAR(50) UNIQUE NOT NULL,  -- 例如：FIRE-A23A1-01-1
  location VARCHAR(200),
  qr_code VARCHAR(100),
  metadata JSONB,                             -- 其他設備資訊
  last_inspection_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### inspection_logs (檢查紀錄)
```sql
CREATE TABLE inspection_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id VARCHAR(50) REFERENCES equipment_list(equipment_id),
  inspector_id UUID NOT NULL,                -- 檢查員 ID
  inspector_name VARCHAR(100),
  inspector_email VARCHAR(200),
  inspection_data JSONB NOT NULL,            -- 檢查結果
  created_at TIMESTAMP DEFAULT NOW()
);

-- inspection_data 範例：
{
  "appearance": true,
  "pressure": true,
  "notes": "正常"
}
```

## 🚀 開發指南

### 安裝依賴
```bash
cd inspection-pwa
npm install
```

### 開發模式
```bash
npm run dev
```

### 建置生產版本
```bash
npm run build
```

### 預覽生產版本
```bash
npm run preview
```

## ⚙️ Supabase 設定

### 1. 建立 Supabase 專案
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊「New Project」建立新專案
3. 選擇區域（建議選擇 Singapore 以獲得較低延遲）
4. 等待專案建立完成

### 2. 執行資料庫 Schema
1. 在 Supabase Dashboard 中，點擊左側選單的「SQL Editor」
2. 開啟專案中的 `supabase/schema.sql` 檔案
3. 複製整個 SQL 內容
4. 貼上到 SQL Editor 中執行
5. 確認執行成功，應該會看到以下資料表：
   - `inspection_categories` - 檢查類別
   - `equipment` - 設備清單
   - `inspection_logs` - 檢查紀錄
   - 以及相關的索引、視圖和觸發器

### 3. 配置環境變數
1. 在專案根目錄，複製 `.env.example` 為 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 在 Supabase Dashboard 中取得 API 金鑰：
   - 點擊左側選單「Project Settings」
   - 選擇「API」分頁
   - 複製以下資訊：
     - `Project URL` → `VITE_SUPABASE_URL`
     - `anon/public key` → `VITE_SUPABASE_ANON_KEY`

3. 編輯 `.env` 檔案，填入取得的資訊：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 4. 測試連線
啟動開發伺服器後，系統會自動嘗試連接 Supabase：
```bash
npm run dev
```

打開瀏覽器開發者工具的 Console，如果看到任何 Supabase 連線錯誤，請檢查：
- `.env` 設定是否正確
- Supabase 專案是否已啟動
- Row Level Security (RLS) 政策是否已正確設定

## 📱 PWA 安裝

### iOS (Safari)
1. 點擊分享按鈕
2. 選擇「加入主畫面」
3. 完成

### Android (Chrome)
1. 點擊選單
2. 選擇「安裝應用程式」
3. 完成

## 🔄 開發進度

1. ✅ 建立基礎專案結構（Vite + Vue 3 + Tailwind CSS）
2. ✅ 配置 OAuth 認證（Wiwynn SSO）
3. ✅ 實現 Pinia stores（auth, categories, inspection）
4. ✅ 建立 UI 組件（BottomNav, CategoryCard）
5. ✅ 建立所有頁面（Login, Home, Scan, History, InspectionForm）
6. ✅ 整合 QR Scanner（html5-qrcode）
7. ✅ 建立 Supabase 配置與 Schema
8. ✅ 實現 CSV 匯出功能

### 待完成功能
- ⏳ 整合 Supabase 實際儲存（目前使用 localStorage）
- ⏳ 照片上傳功能
- ⏳ Service Worker 與離線支援
- ⏳ 推播通知（提醒檢查期限）
- ⏳ 設備位置地圖顯示
- ⏳ 統計報表頁面

## 📝 注意事項

- 確保 OAuth redirect_uri 已在 Wiwynn OAuth Portal 註冊
- 手機瀏覽器需要 HTTPS 才能使用相機（開發時可用 localhost）
- PWA 需要 Service Worker（生產環境自動啟用）

## 👨‍💻 作者

Michael Wang - Wiwynn Corporation
