# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 提供在此專案中工作的指引。

## 專案概述

這是一個為 Wiwynn 公司設備巡檢作業設計的 **mobile-first Progressive Web App (PWA)**。系統支援多種設備類別（滅火器、門禁、逃生門等），具備動態檢查表單、QR Code 掃描和 OAuth 認證功能。

**技術堆疊**: Vue 3 (Composition API), Vite, Tailwind CSS, Pinia, Vue Router, html5-qrcode, Supabase

## 開發指令

```bash
# 安裝相依套件
npm install

# 啟動開發伺服器 (執行於 http://localhost:5173，可透過網路存取 0.0.0.0:5173)
npm run dev

# 建置正式環境版本
npm run build

# 預覽正式環境版本
npm run preview
```

## 架構與核心模式

### Pinia 狀態管理

應用程式使用四個主要的 Pinia stores：

1. **`auth` store** - 使用 Wiwynn SSO 的 OAuth 認證
2. **`categories` store** - 檢查類別與表單配置（目前為靜態資料，TODO: 遷移至 Supabase）
3. **`equipment` store** - 設備清單管理（從 CSV 載入 128 台滅火器）
4. **`inspection` store** - 檢查記錄（目前使用 localStorage，TODO: 遷移至 Supabase）

**重要**: 設備資料目前寫死在 `src/stores/equipment.js`，包含全部 128 台滅火器。每個設備都有 `categoryId: '1'` 連結到滅火器類別。

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
- Redirect URI 必須與 OAuth portal 註冊的完全相符

### 動態表單系統

檢查表單從 categories store 的 `form_config` 動態生成：

```javascript
form_config: {
  fields: [
    { id: 'appearance', label: '...', type: 'checkbox', required: true },
    { id: 'pressure', label: '...', type: 'radio', options: [...], required: true },
    { id: 'notes', label: '...', type: 'textarea', required: false }
  ]
}
```

**支援的表單類型**: `checkbox`, `radio`, `textarea`, `text`

`InspectionForm.vue` 組件根據類別的表單配置動態渲染欄位。

### 路由與導航

**導航流程**：
1. 首頁 (`/`) → 類別卡片顯示進度（例如 "0/128"）
2. 點擊類別 → 設備清單 (`/category/:categoryId/equipment`)
3. 點擊設備 → 檢查表單 (`/inspection/:categoryId/:equipmentId`)
4. 提交 → 返回首頁

**透過 QR 掃描的替代流程**：
- 掃描 QR → 用設備 ID 在 equipment store 查詢 → 帶 `categoryId` 和 `equipmentId` 導向檢查表單

**關鍵路由模式**：檢查表單路由必須同時接收 `categoryId` 和 `equipmentId` 作為 route params（不是 query params）。處理方式：
- 設備清單點擊處理：`router.push({ name: 'inspection-form', params: { categoryId, equipmentId } })`
- QR 掃描後：使用 equipment store 查詢取得 categoryId

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

## 目前資料儲存策略

**目前狀態**（開發階段）：
- OAuth tokens: `localStorage`（keys: `access_token`, `user_name`, `user_email`）
- 檢查記錄: `localStorage`（key: `inspection_logs`）
- 類別: 寫死在 `src/stores/categories.js`
- 設備: 寫死在 `src/stores/equipment.js`（128 台滅火器）

**未來遷移**：
- Supabase client 已設定在 `src/config/supabase.js`（尚未使用）
- 資料庫 schema 定義在 `supabase/schema.sql`（準備部署）
- Stores 有 TODO 註解標記遷移點

## QR Code 掃描

使用 `html5-qrcode` 函式庫。QR code 中的設備 ID 必須符合 equipment store 的 `id` 欄位（例如 `A23A1-01-1`）。

**掃描流程**：
1. 使用者導向 `/scan`
2. `Scan.vue` 請求相機權限
3. 掃描成功後：`processEquipmentId()`
4. 在 equipment store 查詢設備：`equipmentStore.getEquipmentById(equipmentId)`
5. 找到的話：帶 `categoryId` 和 `equipmentId` 導向檢查表單
6. 沒找到：顯示警告

**相機存取需求**：
- 需要 HTTPS（localhost 除外）
- 必須授予瀏覽器權限
- 行動裝置：透過 HTTP 網路存取時相機可能無法運作

## 設備清單結構

全部 128 台滅火器載入時使用此結構：

```javascript
{
  id: 'A23A1-01-1',           // 唯一設備 ID（區域-區-編號）
  categoryId: '1',             // 連結到滅火器類別
  location: 'A23FA1區',        // 實體位置
  name: '乾粉滅火器 20型',     // 設備名稱
  type: '乾粉',                // 類型（乾粉、HFC-236、NAF-10）
  size: '20型',                // 尺寸
  expiryDate: '2027/10/26'    // 到期日
}
```

**區域分布**：A23 (17台), A3 (6台), C8 (29台), C7 (16台), C3 (9台), C2 (11台), C24 (9台), B3 (10台), C26 (21台)

## 常見問題與修正

### 問題："無法識別設備類別"
**原因**：`InspectionForm.vue` 從錯誤來源接收 categoryId
**修正**：確保 categoryId 來自 `route.params.categoryId`（不是 `route.query.categoryId`）

### 問題：設備清單無法捲動
**原因**：父容器有 `overflow-hidden` 或 flexbox 階層不正確
**修正**：使用上述的 mobile-first 版面模式，在內容區域使用 `flex-1 overflow-y-auto`

### 問題：OAuth redirect URI 不符
**原因**：程式碼中的 Redirect URI 與 OAuth portal 註冊的不符
**修正**：確保 `src/config/oauth.js` 中的 `REDIRECT_URI` 完全符合註冊的 URI（包括協定、port、路徑）

### 問題：手機相機無法啟動
**原因**：相機存取需要 HTTPS，或權限被拒絕
**修正**：使用 HTTPS 或 localhost。使用者也可以用手動輸入欄位作為替代方案。

## 行動裝置測試

1. 啟動開發伺服器：`npm run dev`
2. 伺服器執行在 `0.0.0.0:5173`（可透過網路存取）
3. 在手機上，導向 `http://<你的IP>:5173`
4. 要讓 OAuth 回調運作，在 OAuth portal 註冊基於 IP 的 redirect URI

**注意**：透過 HTTP 網路存取時相機無法運作。使用手動輸入或部署 HTTPS 進行完整測試。

## CSV 匯出功能

檢查記錄可透過 `inspectionStore.exportToCSV()` 匯出為 CSV：
- 包含 BOM (`\ufeff`) 以在 Excel 正確顯示中文字元
- 欄位：檢查時間、設備編號、類別、檢查人員、Email、狀態、檢查項目、備註
- 狀態翻譯：`pass` → "合格"，`fail` → "異常"

## Supabase 整合（計劃中）

資料庫 schema 已準備在 `supabase/schema.sql`，包含表格：
- `inspection_categories` - 類別與 JSONB form_config
- `equipment` - 設備清單與 metadata
- `inspection_logs` - 檢查記錄與 JSONB inspection_data

已定義 RLS (Row Level Security) 政策進行多租戶存取控制。

## 程式碼風格與慣例

- **Computed properties** 大量用於響應式資料轉換
- **中文標籤** 用於 UI 和表單配置
- **避免 BEM 命名**，改用 Tailwind utility classes

## 近期更新 (2025-12)

### 1. 歷史紀錄與報表 (History.vue)
- **Table View**: 歷史紀錄改為條列式表格，而非原本的卡片式，方便閱讀大量資料。
- **Context-Aware Column**: 「自訂欄位」功能會根據目前選擇的類別（如滅火器、逃生門）動態顯示該類別的檢查項目。
- **Smart Filter**: 進入頁面時預設選取第一個類別（如滅火器），避免顯示過多不相關資訊。
- **CSV Export**: 匯出 CSV 時僅包含目前選擇類別的有效欄位，不再混雜所有模組的欄位。

### 2. 檢查表單優化 (InspectionForm.vue)
- **Toggle Buttons**: 將傳統勾選框 (Checkbox) 改為更直觀的「正常 (綠) / 異常 (紅)」大型按鈕。
- **Default State**: 預設狀態為空 (null)，強制檢查人員必須明確選擇結果，防止漏檢。
- **Service Master**: 新增「服務小當家異常通報」連結按鈕，方便現場人員直接通報重大異常。
- **Equipment Details Card**: 在檢查表單頂部新增設備詳細資訊卡片，顯示設備編號、位置、名稱、類型/尺寸、到期日等資訊。
  - 到期日智能提醒：6 個月內即將到期的設備會以紅色標示並顯示警告標誌
  - 使用藍色漸變標題區分資訊區塊，提升視覺層次
  - 網格化布局，資訊緊湊清晰，適合行動裝置閱讀

### 3. 資料一致性 (Categories Store)
- **Sync**: `src/stores/categories.js` 中的檢查項目已與 `檢點表/*.csv` 完成同步。
- **Exit Door Revision**: 逃生門項目已更新為 5 項（外觀、開關、門把、警報、障礙物）。
- **Fire Shutter Revision**: 防火鐵捲門項目已更新為 7 項。

### 4. 開發注意事項
- **新增類別**: 若需新增設備類別，請務必先參考 `檢點表` 資料夾中的 CSV，確保 `categories.js` 欄位一致。
- **測試**: 建議使用 Chrome 開發者工具的手機模式進行模擬，確認 Toggle Button 大小是否適合觸控。
- **測試**: 建議使用 Chrome 開發者工具的手機模式進行模擬，確認 Toggle Button 大小是否適合觸控。

### 5. 檢查流程優化 (Workflow)
- **Continuous Scan**: 送出檢查單後，系統自動導向掃描頁面 (`/scan`)，實現連續檢查流程。
- **One-Click Check**: 點擊頁面右上角的**類別圖示** (Category Icon)，可將所有勾選項目一鍵設為「正常」。
- **Updated Links**: 異常通報連結已更新至最新的 Office Forms。
