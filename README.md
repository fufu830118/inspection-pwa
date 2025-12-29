# 巡檢系統 PWA - Wiwynn Inspection System

## 專案概述

這是一個為 Wiwynn 公司設備巡檢作業設計的 **mobile-first Progressive Web App (PWA)**。系統支援 15 種設備類別（滅火器、自動門、防火鐵捲門等），具備動態檢查表單、QR Code 掃描和 OAuth 認證功能。

**技術堆疊**: Vue 3, Vite, Tailwind CSS, Pinia, Vue Router, html5-qrcode, PapaCSV

## 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

專案會自動啟用 HTTPS，訪問 `https://localhost:5173`

### 建置正式環境版本

```bash
npm run build
```

## 主要特色

- 📱 **Mobile-First 設計** - 採用觸控友善的底部導航欄
- 🔐 **Wiwynn OAuth 認證** - 使用公司內部 OAuth SSO 系統
- 📷 **QR Code 掃碼** - 快速識別設備並開啟對應表單
- 📊 **動態表單系統** - 從 CSV 檔案動態載入檢查項目
- 📤 **CSV 匯出** - 支援匯出檢查紀錄為 Excel 可讀格式
- 🔌 **PWA 支援** - 可安裝到手機主畫面，支援離線使用

## 專案結構

```
inspection-pwa/
├── public/
│   └── 檢點表/                    # CSV 資料來源
│       ├── 滅火器/
│       │   ├── 頻率.csv
│       │   ├── 檢點項目.csv
│       │   ├── 設備清單.csv
│       │   └── 滅火器詳細清單.csv
│       └── ... (其他 14 個類別)
├── src/
│   ├── components/              # Vue 組件
│   ├── views/                   # 頁面組件
│   ├── stores/                  # Pinia Stores
│   ├── composables/             # Composable 函數
│   ├── utils/                   # 工具函數
│   ├── config/                  # 配置文件
│   └── router/                  # 路由配置
└── CLAUDE.md                    # 完整技術文檔（供 AI 使用）
```

## 核心功能

### 1. OAuth 認證流程
1. 用戶點擊「登入」→ 導向 Wiwynn OAuth 頁面
2. 使用員工帳號登入
3. 回調到應用，獲取 access token
4. 儲存用戶資訊到 Pinia store

### 2. QR Code 掃描流程
1. 點擊底部「掃碼」按鈕
2. 開啟相機掃描 QR Code
3. 系統自動識別設備類別和編號
4. 導向對應的檢查表單

### 3. 動態檢查表單
- 從 CSV 檔案動態載入檢查項目
- 支援布林、數字、簡答等題型
- 表單驗證與提交
- 檢查記錄儲存到 localStorage

### 4. 統計報表
- 任務完成率（圓餅圖）
- 巡檢缺失趨勢（折線圖）
- 缺失類型分佈（長條圖）
- 設備妥善率（KPI 儀表板）

## 15 個設備類別

1. 滅火器 (FIREXT)
2. 自動門 (AUTD)
3. 防火鐵捲門 (FIRD)
4. 逃生門 (EXIT)
5. 會議室 (ROOM)
6. 緊急沖眼器查檢表 (EYE)
7. 事務機 (OFA)
8. 送風機 (FAN)
9. 氣冷箱型冷氣機 (CHI)
10. 實驗室大電盤 (LABPOW-BIG)
11. 辦公室大盤和實驗室小盤 (LABPOW-MIX)
12. 辦公室小電盤 (OFFPOW-SMALL)
13. 辦公室機房電盤 (OFFPOW-SERVER)
14. 化學品室環境 (CHEM)
15. 化學品洩漏處理車 (CHEMCART)

## 開發環境配置

### HTTPS 支援

專案已配置 `@vitejs/plugin-basic-ssl` 自動啟用 HTTPS，以支援：
- QR Code 掃描（相機 API 需要 HTTPS）
- OAuth 認證（生產環境要求）

**首次訪問步驟**：
1. 訪問 `https://localhost:5173`
2. 看到憑證警告，點擊「進階」→「繼續」
3. 即可正常使用

### OAuth 設定

需在 Wiwynn OAuth Portal 註冊以下 Redirect URI：
- 電腦開發：`https://localhost:5173/auth/callback`
- 手機測試：`https://<你的IP>:5173/auth/callback`

環境變數配置 (`.env.local`)：
```bash
VITE_OAUTH_REDIRECT_URI=https://10.178.209.239:5173/auth/callback
```

## 新增設備類別

1. 在 `public/檢點表/` 建立新資料夾（例如：`新設備/`）
2. 建立以下 CSV 檔案：
   - `頻率.csv` - 檢查頻率
   - `檢點項目.csv` - 檢查表單欄位定義
   - `設備清單.csv` - 設備 ID 與 QR Code 對應
   - `{類別名稱}詳細清單.csv` - 設備詳細資訊（可選）

3. 更新 `src/utils/csvLoader.js` 的 `categoryFolders` 陣列：
   ```javascript
   { name: '新設備', icon: '🔧', id_prefix: 'NEWDEV' }
   ```

4. 重新啟動開發伺服器即可看到新類別

## 手機測試

### 電腦測試
1. 使用 Chrome DevTools 的手機模式 (F12 → Toggle device toolbar)
2. 訪問 `https://localhost:5173`

### 手機測試
1. 確認電腦和手機在同一網路
2. 查詢電腦 IP：`ipconfig`（Windows）或 `ifconfig`（Mac/Linux）
3. 手機訪問 `https://<你的IP>:5173`
4. 信任自簽憑證即可使用相機功能

## 常見問題

### Q: OAuth 登入後顯示 "Invalid redirect_uri"
**A:** 確認 `.env.local` 中的 `VITE_OAUTH_REDIRECT_URI` 已在 Wiwynn OAuth Portal 註冊。

### Q: 相機無法啟動
**A:**
- 確保使用 HTTPS 訪問（開發環境 `https://localhost:5173`）
- 檢查瀏覽器相機權限設定
- iOS Safari 需要使用者手動點擊按鈕才能啟動相機

### Q: CSV 解析錯誤
**A:**
- 確認 CSV 使用 UTF-8 with BOM 編碼
- 確認第一行為欄位名稱
- 確認「必填」欄位值為「是」或「否」
- 確認「題型」欄位值為「布林」、「數字」或「簡答」

### Q: QR Code 掃描找不到設備
**A:**
- 檢查 `設備清單.csv` 中的「編碼顯示」欄位是否有該設備 ID
- 檢查「亂碼」欄位是否與 QR Code 掃描結果一致
- 使用瀏覽器 Console 查看 `equipmentStore.equipmentList` 確認設備已載入

## 技術文檔

詳細的技術文檔請參閱 [CLAUDE.md](CLAUDE.md)，包含：
- 完整的架構說明
- 路由與導航流程
- CSV 資料結構
- Pinia Store 詳細說明
- 開發注意事項
- 更新歷史

## 未來規劃

- [ ] Supabase 整合（取代 localStorage）
- [ ] 離線模式支援（Service Worker）
- [ ] 推播通知（到期提醒、未完成檢查提醒）
- [ ] 多語言支援（i18n）
- [ ] 深色模式
- [ ] 設備維修記錄功能
- [ ] 批次匯入設備（Excel/CSV 上傳）
- [ ] 權限管理系統（管理員/檢查員角色）

## 聯絡資訊

**開發者**: Michael Wang - Wiwynn Corporation
**專案建立日期**: 2025-12

---

**最後更新**: 2025-12-29
**版本**: 2.0.0
