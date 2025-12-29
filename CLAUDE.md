# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 提供在此專案中工作的指引。

## 專案概述

這是一個為 Wiwynn 公司設備巡檢作業設計的 **mobile-first Progressive Web App (PWA)**。系統支援 15 種設備類別（滅火器、自動門、防火鐵捲門、逃生門、會議室等），具備動態檢查表單、QR Code 掃描和 OAuth 認證功能。

**技術堆疊**: Vue 3 (Composition API), Vite, Tailwind CSS, Pinia, Vue Router, html5-qrcode, PapaCSV

**資料來源**: 所有類別和設備資料從 `public/檢點表/` 資料夾的 CSV 檔案動態載入

## 開發指令

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器 (執行於 https://localhost:5173，支援 HTTPS 供相機功能使用)
npm run dev

# 建置正式環境版本
npm run build

# 預覽正式環境版本
npm run preview
```

## 架構與核心模式

### Pinia 狀態管理

應用程式使用四個主要的 Pinia stores：

1. **`auth` store** (`src/stores/auth.js`) - 使用 Wiwynn SSO 的 OAuth 認證
2. **`categories` store** (`src/stores/categories.js`) - 檢查類別與表單配置（從 CSV 動態載入）
3. **`equipment` store** (`src/stores/equipment.js`) - 設備清單管理（從 CSV 動態載入）
4. **`inspection` store** (`src/stores/inspection.js`) - 檢查記錄（目前使用 localStorage）

### CSV 資料結構

**資料夾結構**：
```
public/檢點表/
├── 滅火器/
│   ├── 頻率.csv           # 檢查頻率（例如：每月）
│   ├── 檢點項目.csv       # 檢查表單欄位定義
│   ├── 設備清單.csv       # 設備 ID 與 QR Code 亂碼對應
│   └── 滅火器詳細清單.csv # 設備詳細資訊（位置、類型、到期日）
├── 自動門/
│   ├── 頻率.csv
│   ├── 檢點項目.csv
│   └── 設備清單.csv
└── ... (其他 13 個類別)
```

**CSV 檔案格式**：

1. **頻率.csv**
```csv
頻率
每月
```

2. **檢點項目.csv**
```csv
項目名稱,題型,檢查重點,正常標準,異常標準,必填
瓶身外觀是否無鏽蝕狀況,布林,檢查滅火器外觀,無鏽蝕、凹陷,有明顯鏽蝕或變形,是
壓力指針是否在綠色範圍,布林,檢查壓力表指針位置,指針在綠色區域,指針在紅色或黃色區域,是
```

3. **設備清單.csv**
```csv
編碼顯示,亂碼,顯示名稱,長度,寬度,顏色
FIREXT-A23-A1-01-1,QR_CODE_HASH_1234,乾粉滅火器 20型,,,
```

4. **{類別名稱}詳細清單.csv**
```csv
編號,位置,標題,滅火器類型,尺寸,有效日期
A23A1-01-1,A23FA1區,乾粉滅火器 20型,乾粉,20型,2027/10/26
```

**支援的題型**：
- `布林` → 轉換為 checkbox（正常/異常大型按鈕）
- `數字` → 轉換為 number input
- `簡答` → 轉換為 textarea
- 其他 → 轉換為 text input

### OAuth 流程架構

使用 Wiwynn 內部 OAuth 伺服器的 **Authorization Code Flow**：

1. 使用者點擊登入 → 導向 Wiwynn OAuth (`https://one.wiwynn.com/oauth/v2.0/authorize`)
2. 認證完成後 → 回調至 `/auth/callback` 並帶 authorization code
3. 使用 HTTP Basic Auth 交換 access token（CLIENT_ID:CLIENT_SECRET 放在 Authorization header）
4. Token endpoint 使用 **Vite proxy** (`/oauth-proxy`) 避免 CORS 問題
5. 取得使用者資訊並儲存至 Pinia auth store

**OAuth 關鍵細節**：
- Token URL 透過 Vite 代理：`/oauth-proxy` → `https://one.wiwynn.com/oauth/v2.0`
- 使用 HTTP Basic Authentication 進行 token 交換
- State 和 nonce 儲存在 sessionStorage 做 CSRF 保護
- Redirect URI 動態判斷（支援 localhost 和網路 IP），必須在 OAuth portal 註冊
- **HTTPS 要求**：開發環境已配置 `@vitejs/plugin-basic-ssl` 自動啟用 HTTPS

### 路由與導航架構

**所有頁面共用統一架構**：

```
首頁 (/)
  → 點擊類別卡片
  → 設備列表頁 (/category/:categoryId/equipment)
      → 右上角「掃描按鈕」→ 掃描頁 (/scan)
      → 點擊「已檢查設備」→ 檢查表單（查看模式）
      → 點擊「未檢查設備」→ 提示必須使用 QR Code 掃描
```

**QR Code 掃描流程**（唯一進入新檢查的方式）：

```
掃描頁 (/scan)
  → 掃描 QR Code
  → 系統識別設備 ID 和類別
  → 自動導向檢查表單 (/inspection/:categoryId/:equipmentId)
  → 完成檢查並送出
  → 自動返回掃描頁 (/scan) - 連續檢查流程
```

**重要設計原則**：
- ✅ **只能透過 QR Code 掃描進入新的檢查表單**
- ✅ 未檢查的設備在列表中「可以點擊」，但會跳出提示要求使用 QR Code 掃描
- ✅ 已檢查的設備可以點擊查看檢查記錄
- ✅ 送出檢查後自動返回掃描頁面，實現連續巡檢流程
- ❌ 沒有手動輸入設備編號的功能
- ❌ 設備列表不提供「開始檢查」按鈕

**關鍵路由定義** (`src/router/index.js`)：
```javascript
{
  path: '/',
  name: 'home',
  component: () => import('../views/Home.vue')
},
{
  path: '/category/:categoryId/equipment',
  name: 'equipment-list',
  component: () => import('../views/EquipmentList.vue')
},
{
  path: '/scan',
  name: 'scan',
  component: () => import('../views/Scan.vue')
},
{
  path: '/inspection/:categoryId/:equipmentId',
  name: 'inspection-form',
  component: () => import('../views/InspectionForm.vue')
},
{
  path: '/history',
  name: 'history',
  component: () => import('../views/History.vue')
},
{
  path: '/statistics',
  name: 'statistics',
  component: () => import('../views/Statistics.vue')
}
```

### 核心頁面說明

#### 1. Home.vue - 首頁
- 顯示所有設備類別卡片
- 每個卡片顯示：類別名稱、圖示、本月檢查進度
- 點擊任何類別都導向統一的設備列表頁 (`EquipmentList.vue`)
- **沒有特殊處理**：所有類別使用相同的導航邏輯

#### 2. EquipmentList.vue - 設備列表頁（所有類別共用）
- **標題列**：
  - 左側：返回按鈕
  - 中間：類別名稱 + 圖示 + 進度資訊
  - 右側：QR Code 掃描按鈕（導向 `/scan`）
- **進度條**：顯示本月檢查完成度百分比
- **篩選標籤**：全部 / 未檢查 / 已檢查
- **設備卡片**：
  - 顯示：設備 ID、名稱、位置、到期日、檢查狀態
  - 未檢查設備：可點擊但會提示「請使用 QR Code 掃描功能進行檢查」
  - 已檢查設備：點擊可查看檢查記錄

#### 3. Scan.vue - QR Code 掃描頁
- **標題列**：返回按鈕 + 標題
- **掃描區域**：使用 html5-qrcode 函式庫
- **掃描邏輯**：
  1. 先用「亂碼」欄位查找設備 (`getEquipmentByQRCode`)
  2. 找不到則用「編碼顯示」查找 (`getEquipmentById`)
  3. 找到後自動導向檢查表單
  4. 找不到則顯示錯誤訊息
- **無手動輸入功能**（已移除）

#### 4. InspectionForm.vue - 檢查表單頁
- **設備資訊卡片**：
  - 設備編號、位置、名稱、類型/尺寸、到期日
  - 到期日智能提醒（6個月內顯示紅色警告）
- **快速檢查**：點擊右上角類別圖示，一鍵將所有項目設為「正常」
- **動態表單欄位**：從 CSV 載入的檢點項目動態生成
- **Toggle 按鈕**：布林題型使用大型「正常/異常」按鈕
- **送出後流程**：顯示成功訊息 → 自動導向 `/scan`

#### 5. History.vue - 歷史紀錄頁
- 表格式顯示所有檢查記錄
- 類別篩選器（預設選擇第一個類別）
- 自訂欄位功能：根據選擇的類別動態顯示該類別的檢點項目
- CSV 匯出（僅匯出目前選擇類別的資料）

#### 6. Statistics.vue - 統計儀表板
- **任務完成率**（圓餅圖）：已完成/未完成/逾期完成
- **巡檢缺失趨勢**（折線圖）：本月每日或每週缺失件數
- **缺失類型分佈**（長條圖）：找出最常出問題的類別
- **設備妥善率**（KPI 儀表板）：計算公式 = (正常項次 ÷ 總項次) × 100%

### 進度追蹤系統

使用檢查記錄進行**每月**進度追蹤：

```javascript
// 在 equipment.js store 中
getCategoryProgress(categoryId) {
  const equipment = equipmentList.filter(eq => eq.categoryId === categoryId)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const checkedEquipment = equipment.filter(eq => {
    return inspectionStore.inspections.some(log => {
      const logDate = new Date(log.created_at)
      return log.equipment_id === eq.id &&
             logDate.getMonth() === currentMonth &&
             logDate.getFullYear() === currentYear
    })
  })

  return {
    checked: checkedEquipment.length,
    total: equipment.length,
    percentage: Math.round((checkedEquipment.length / total) * 100)
  }
}
```

這確保每個設備每月都必須檢查，且進度每月重置。

### Mobile-First 版面模式

所有頁面使用 **flex column 版面** 在手機上正確捲動：

```vue
<template>
  <div class="h-full flex flex-col">
    <!-- 固定標題 -->
    <div class="flex-shrink-0 bg-white border-b ...">...</div>

    <!-- 可捲動內容 -->
    <div class="flex-1 overflow-y-auto ...">
      <!-- 內容 -->
    </div>
  </div>
</template>
```

**關鍵 CSS**：
- `html, body` 有 `h-full overflow-hidden`（在 `src/style.css`）
- App.vue 的 router-view 有 `flex-1`（沒有 `overflow-hidden`）
- 每個頁面用上述模式管理自己的捲動

**觸控優化**：
- 所有可互動元素有 `min-height: 44px`（iOS 觸控目標尺寸）
- Inputs 有 `font-size: 16px !important` 防止 iOS 縮放
- 用 `-webkit-tap-highlight-color: transparent` 停用點擊反白
- Active 狀態使用 `active:scale-95` 提供觸覺回饋

## 資料儲存策略

**目前狀態**（開發階段）：
- OAuth tokens: `localStorage`（keys: `access_token`, `user_name`, `user_email`）
- 檢查記錄: `localStorage`（key: `inspection_logs`）
- 類別配置: 從 `public/檢點表/*/檢點項目.csv` 動態載入
- 設備清單: 從 `public/檢點表/*/設備清單.csv` 動態載入

**CSV 載入邏輯** (`src/utils/csvLoader.js`)：
```javascript
// 載入所有類別
export async function loadAllCategories() {
  const categoryFolders = [
    { name: '滅火器', icon: '🧯', id_prefix: 'FIREXT' },
    { name: '自動門', icon: '🚪', id_prefix: 'AUTD' },
    // ... 共 15 個類別
  ]

  for (const folder of categoryFolders) {
    const frequency = await loadCSV(folder.name, '頻率.csv')
    const inspectionItems = await loadCSV(folder.name, '檢點項目.csv')
    const formConfig = convertInspectionItemsToFormConfig(inspectionItems)
    // ...
  }
}

// 載入設備清單（含詳細資訊合併）
export async function loadEquipmentList(categoryName) {
  const equipmentData = await loadCSV(categoryName, '設備清單.csv')
  const detailedData = await loadCSV(categoryName, `${categoryName}詳細清單.csv`)

  // 合併兩個清單
  return equipmentData.map(row => ({
    id: row['編碼顯示'],
    qrCode: row['亂碼'],
    name: row['顯示名稱'] || detailRow?.['標題'],
    location: detailRow?.['位置'],
    type: detailRow?.['滅火器類型'] || detailRow?.['類型'],
    size: detailRow?.['尺寸'],
    expiryDate: detailRow?.['有效日期']
  }))
}
```

## QR Code 掃描

使用 `html5-qrcode` 函式庫 (`src/composables/useQRScanner.js`)。

**雙重查找機制**：
1. 先用 QR Code 亂碼查找：`equipmentStore.getEquipmentByQRCode(qrCodeHash)`
2. 找不到再用設備編號查找：`equipmentStore.getEquipmentById(equipmentId)`

**掃描流程** (`src/views/Scan.vue`)：
```javascript
function processEquipmentId(qrCodeOrId) {
  // 先嘗試用 QR Code (亂碼) 查找設備
  let equipment = equipmentStore.getEquipmentByQRCode(qrCodeOrId)

  // 如果找不到，再嘗試用設備編號查找
  if (!equipment) {
    equipment = equipmentStore.getEquipmentById(qrCodeOrId)
  }

  if (equipment) {
    stopScanning()
    router.push({
      name: 'inspection-form',
      params: {
        categoryId: equipment.categoryId,
        equipmentId: equipment.id
      }
    })
  } else {
    alert(`找不到設備: ${qrCodeOrId}`)
  }
}
```

**相機存取需求**（重要！）：
- **必須使用 HTTPS**（相機 API 安全限制）
- 開發環境已配置 `@vitejs/plugin-basic-ssl` 自動生成自簽憑證
- 首次訪問需信任憑證（瀏覽器會顯示安全警告，選擇「繼續」即可）
- 必須授予瀏覽器相機權限

## 設備清單結構

每個設備物件包含以下欄位：

```javascript
{
  id: 'FIREXT-A23-A1-01-1',    // 唯一設備 ID（完整編碼）
  qrCode: 'QR_HASH_12345',     // QR Code 掃描後的亂碼
  name: '乾粉滅火器 20型',      // 設備名稱
  categoryId: '1',              // 所屬類別 ID
  categoryName: '滅火器',       // 類別名稱
  location: 'A23FA1區',         // 實體位置
  type: '乾粉',                 // 類型
  size: '20型',                 // 尺寸
  expiryDate: '2027/10/26',    // 到期日
  length: '',                   // 長度（可選）
  width: '',                    // 寬度（可選）
  color: ''                     // 顏色（可選）
}
```

**15 個設備類別**：
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

## 行動裝置測試

### 開發環境 HTTPS 配置

專案已配置 `@vitejs/plugin-basic-ssl` 自動啟用 HTTPS：

1. **啟動開發伺服器**：`npm run dev`
2. **電腦訪問**：`https://localhost:5173`
3. **手機訪問**：`https://<你的IP>:5173`（例如 `https://10.178.209.239:5173`）

### 首次訪問步驟

**電腦瀏覽器**：
1. 訪問 `https://localhost:5173`
2. 看到「您的連線不是私人連線」警告
3. 點擊「進階」→「繼續前往 localhost (不安全)」
4. 即可正常使用

**手機瀏覽器**：
1. 訪問 `https://<你的IP>:5173`
2. 看到憑證警告
3. 選擇「繼續」或「仍要繼續」
4. 相機功能即可正常運作

### OAuth 設定

**環境變數配置** (`.env.local`)：
```bash
# OAuth 配置 - 手機測試模式
# 使用當前網路 IP 的 Redirect URI
VITE_OAUTH_REDIRECT_URI=https://10.178.209.239:5173/auth/callback
```

需在 OAuth portal 註冊以下 Redirect URI：
- 電腦開發：`https://localhost:5173/auth/callback`
- 手機測試：`https://<你的IP>:5173/auth/callback`

## CSV 匯出功能

檢查記錄可透過 `inspectionStore.exportToCSV()` 匯出為 CSV：
- 包含 BOM (`\ufeff`) 以在 Excel 正確顯示中文字元
- 欄位：檢查時間、設備編號、類別、檢查人員、Email、狀態、檢查項目、備註
- 狀態翻譯：`pass` → "合格"，`fail` → "異常"
- 智能欄位選擇：根據目前選擇的類別只匯出相關欄位

## 程式碼風格與慣例

- **Computed properties** 大量用於響應式資料轉換
- **中文標籤** 用於 UI 和表單配置
- **避免 BEM 命名**，改用 Tailwind utility classes
- **Vue 3 Composition API** 使用 `<script setup>` 語法

## 重要更新歷史 (2025-12)

### 1. CSV 動態載入系統 (2025-12-28)
- **移除硬編碼資料**：刪除 `src/stores/categories.js` 中 270+ 行的靜態類別資料
- **CSV 結構優化**：將「頻率」欄位從檢點項目 CSV 第一行移至獨立的 `頻率.csv`
- **Python 批次處理**：使用 `fix_csv.py` 批次處理 15 個類別資料夾，自動分離頻率資料
- **雙清單合併**：設備清單 + 詳細清單自動合併，提供完整設備資訊
- **資料驗證**：增加 CSV 解析時的欄位驗證，過濾無效資料列

### 2. 統一頁面架構 (2025-12-29)
- **刪除獨立頁面**：移除 `FireExtinguisherHome.vue`，所有類別統一使用 `EquipmentList.vue`
- **統一導航邏輯**：`Home.vue` 不再特殊處理滅火器，所有類別使用相同路由
- **QR 掃描按鈕**：在 `EquipmentList.vue` 右上角新增掃描按鈕
- **掃描頁返回按鈕**：`Scan.vue` 新增返回按鈕

### 3. 存取控制優化 (2025-12-29)
- **移除手動輸入**：刪除所有手動輸入設備編號的功能
  - 刪除 `ManualInput.vue` 頁面
  - 刪除 `/manual-input` 路由
  - 從 `Scan.vue` 移除手動輸入按鈕和彈窗
- **點擊行為改進**：
  - 未檢查設備：可點擊但顯示提示「請使用 QR Code 掃描功能進行檢查」
  - 已檢查設備：可點擊查看檢查記錄
  - 移除禁止游標樣式，改用友善的提示訊息

### 4. 歷史紀錄與報表 (History.vue)
- **Table View**: 歷史紀錄改為條列式表格，而非原本的卡片式，方便閱讀大量資料
- **Context-Aware Column**: 「自訂欄位」功能會根據目前選擇的類別動態顯示該類別的檢查項目
- **Smart Filter**: 進入頁面時預設選取第一個類別，避免顯示過多不相關資訊
- **CSV Export**: 匯出 CSV 時僅包含目前選擇類別的有效欄位

### 5. 檢查表單優化 (InspectionForm.vue)
- **Toggle Buttons**: 將傳統勾選框 (Checkbox) 改為更直觀的「正常 (綠) / 異常 (紅)」大型按鈕
- **Default State**: 預設狀態為空 (null)，強制檢查人員必須明確選擇結果，防止漏檢
- **Service Master**: 新增「服務小當家異常通報」連結按鈕
- **Equipment Details Card**: 在檢查表單頂部新增設備詳細資訊卡片
  - 顯示：設備編號、位置、名稱、類型/尺寸、到期日
  - 到期日智能提醒：6 個月內即將到期的設備會以紅色標示並顯示警告標誌
  - 使用藍色漸變標題區分資訊區塊

### 6. 統計儀表板 (Statistics.vue)
完全重寫統計頁面，使用 Vue 3 + CSS/SVG 實現 4 個圖表（無外部圖表庫）：

1. **任務完成率**（圓餅圖）
   - 使用 SVG circle + stroke-dasharray 技術
   - 顯示：已完成 / 未完成 / 逾期完成

2. **巡檢缺失趨勢**（折線圖）
   - 使用 SVG polyline
   - 顯示本月每日或每週缺失件數

3. **缺失類型分佈**（長條圖）
   - 使用 CSS gradient
   - 顏色編碼：綠色 (≥95%)、黃色 (80-94%)、紅色 (<80%)

4. **設備妥善率**（KPI 儀表板）
   - 計算公式：(本月設備正常項次 ÷ 本月設備應正常項次) × 100%
   - 分設備類型顯示

### 7. 檢查流程優化 (Workflow)
- **Continuous Scan**: 送出檢查單後，系統自動導向掃描頁面 (`/scan`)，實現連續檢查流程
- **One-Click Check**: 點擊頁面右上角的**類別圖示** (Category Icon)，可將所有勾選項目一鍵設為「正常」
- **Updated Links**: 異常通報連結已更新至最新的 Office Forms

### 8. HTTPS 開發環境 (2025-12-10)
- **自動 HTTPS**: 安裝 `@vitejs/plugin-basic-ssl` 套件，開發伺服器自動啟用 HTTPS
- **相機功能**: QR Code 掃描需要 HTTPS，現已支援電腦和手機測試
- **動態 Redirect URI**: OAuth 回調 URI 自動根據訪問來源判斷（支援 localhost 和網路 IP）
- **自簽憑證**: 使用自簽憑證，首次訪問需信任憑證

### 9. Teams 通知系統 (2025-12-11)
- **Power Automate Webhook**: 使用 Power Automate HTTP 觸發器整合 Teams 通知
- **Adaptive Card 訊息**: 美觀的卡片式訊息，支援顏色標示（藍色/黃色/紅色）
- **Python Flask 後端**: Teams 通知服務運行在 `http://localhost:5001`
- **5 種通知類型**:
  - 🔔 測試通知 (`GET /api/teams/test`)
  - ⚠️ 設備到期提醒 (`POST /api/teams/expiry-alert`)
  - 📋 檢查進度提醒 (`POST /api/teams/inspection-reminder`)
  - 🚨 異常設備通知 (`POST /api/teams/inspection-abnormal`)
  - 💬 自訂訊息 (`POST /api/teams/custom`)

**啟動 Teams 通知服務**:
```bash
cd email-server
python teams_notifier.py
```

**API 使用範例**:
```bash
# 測試通知
curl http://localhost:5001/api/teams/test

# 發送自訂訊息
curl -X POST http://localhost:5001/api/teams/custom \
  -H "Content-Type: application/json" \
  -d '{"title": "標題", "message": "內容"}'
```

**設定步驟**:
1. 在 Power Automate 建立「收到 HTTP 要求時」觸發器
2. 新增「Post card in a chat or channel」動作
3. 在調適型卡片欄位使用運算式：`triggerOutputs()?['body']?['attachments']?[0]?['content']`
4. 儲存後取得 Webhook URL
5. 更新 `email-server/.env` 的 `TEAMS_WEBHOOK_URL`

## 開發注意事項

### 新增設備類別

若需新增設備類別，請按以下步驟：

1. **準備 CSV 檔案**：
   - 在 `public/檢點表/` 建立新資料夾（例如：`新設備/`）
   - 建立 `頻率.csv`、`檢點項目.csv`、`設備清單.csv`
   - 如有詳細資訊，建立 `{類別名稱}詳細清單.csv`

2. **更新 csvLoader.js**：
   - 在 `loadAllCategories()` 的 `categoryFolders` 陣列中新增類別定義：
   ```javascript
   { name: '新設備', icon: '🔧', id_prefix: 'NEWDEV' }
   ```
   - 在 `loadAllEquipment()` 的 `categoryFolders` 陣列中新增類別名稱

3. **測試載入**：
   - 啟動開發伺服器
   - 檢查瀏覽器 Console 確認 CSV 載入成功
   - 確認首頁顯示新類別卡片

### 常見問題與修正

#### 問題："無法識別設備類別"
**原因**：`InspectionForm.vue` 從錯誤來源接收 categoryId
**修正**：確保 categoryId 來自 `route.params.categoryId`（不是 `route.query.categoryId`）

#### 問題：設備清單無法捲動
**原因**：父容器有 `overflow-hidden` 或 flexbox 階層不正確
**修正**：使用上述的 mobile-first 版面模式，在內容區域使用 `flex-1 overflow-y-auto`

#### 問題：CSV 解析錯誤或欄位對不上
**原因**：CSV 檔案格式不正確或有多餘空白列
**修正**：
1. 確認 CSV 使用 UTF-8 with BOM 編碼
2. 確認第一行為欄位名稱（項目名稱、題型、檢查重點...）
3. 確認「必填」欄位值為「是」或「否」
4. 確認「題型」欄位值為「布林」、「數字」或「簡答」

#### 問題：QR Code 掃描找不到設備
**原因**：設備 ID 或 QR Code 亂碼在 CSV 中不存在
**修正**：
1. 檢查 `設備清單.csv` 中的「編碼顯示」欄位是否有該設備 ID
2. 檢查「亂碼」欄位是否與 QR Code 掃描結果一致
3. 使用瀏覽器 Console 查看 `equipmentStore.equipmentList` 確認設備已載入

#### 問題：手機相機無法啟動
**原因**：相機存取需要 HTTPS，或權限被拒絕
**解決**：
1. 確認使用 HTTPS 訪問（`https://` 開頭）
2. 首次訪問時信任自簽憑證
3. 在瀏覽器權限設定中允許相機存取
4. 確認手機瀏覽器支援 WebRTC（建議使用 Chrome 或 Safari）

## 測試建議

- **桌面測試**：使用 Chrome DevTools 的手機模式 (F12 → Toggle device toolbar)
- **手機測試**：使用實體手機訪問 `https://<你的IP>:5173`
- **QR Code 測試**：準備測試用 QR Code，內容為設備 ID 或亂碼
- **觸控測試**：確認按鈕大小適合觸控（至少 44x44px）
- **表單測試**：測試所有題型（布林、數字、簡答）的輸入和驗證

## 未來規劃

- [ ] Supabase 整合（取代 localStorage）
- [ ] 離線模式支援（Service Worker）
- [ ] 推播通知（到期提醒、未完成檢查提醒）
- [ ] 多語言支援（i18n）
- [ ] 深色模式
- [ ] 設備維修記錄功能
- [ ] 批次匯入設備（Excel/CSV 上傳）
- [ ] 權限管理系統（管理員/檢查員角色）
