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

**核心配置**：
```
public/檢點表/
├── 類別配置.csv        # ⭐ 中央配置文件（定義所有類別、頻率、圖示、ID前綴）
├── 頻率.csv            # (已整合至類別配置與設備配置)
├── 檢點項目範本.csv    # 給同仁的填寫範本
└── 區域/               # 區域檢查系統
    ├── 設備配置.csv        # 定義該區域有哪些設備類型及對應頻率
    ├── 區域設備詳細清單.csv # ⭐ 核心資料：定義每個區域的實際設備編號與細節
    ├── 事務機_每月.csv     # 檢查表單
    ├── 植栽_每週.csv       # 檢查表單
    └── ...
```

**重要 CSV 檔案格式**：

1. **類別配置.csv** (系統核心)
```csv
類別ID,類別名稱,圖示,頻率,ID前綴
1,滅火器,🧯,每月,FIREXT
2,自動門,🚪,每季,AUTD
16,區域,📍,每月,OFA  <-- 區域檢查入口
```

2. **區域設備詳細清單.csv** (同仁維護重點)
```csv
區域ID,設備類型,設備編號,設備名稱,廠牌,型號,位置,備註
OFA-A23-A2-01,事務機,OFA-A23-A2-01-P1,RICOH彩色印表機,RICOH,MP C3004,窗邊,
OFA-A23-A2-01,事務機,OFA-A23-A2-01-P2,HP雷射印表機,HP,LaserJet Pro,門口,
```

3. **設備配置.csv** (區域系統配置)
```csv
設備類型,頻率,CSV檔案,顯示名稱
事務機,每月,事務機_每月.csv,事務機月檢
植栽,每週,植栽_每週.csv,植栽週檢
```

### 區域檢查流程 (Area Inspection)

這是一個雙層級的檢查系統，專為辦公區域設計：

1. **掃描區域 QR Code** (例如 `OFA-C24-C2-01`)
2. **進入設備選擇頁** (`AreaDeviceSelector.vue`)
   - 系統自動從 `區域設備詳細清單.csv` 撈取該區域的所有設備
   - 顯示設備列表 (例如 "事務機1", "事務機2", "植栽")
   - *未檢查的區域設備無法直接點擊，必須掃描 QR Code (與一般設備一致)*
3. **選擇設備進行檢查**
   - 載入對應頻率的檢查表單 (例如 `事務機_每月.csv`)
   - 表單上方顯示該設備的詳細資訊 (廠牌、型號、位置)

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
  → 點擊一般類別 (如滅火器) → 設備列表 (/category/:id) → 掃描檢查
  → 點擊區域類別 (ID 16)   → 區域列表 (/category/16) 
      → 點擊區域 (提示掃描) 
      → 掃描區域 QR 
      → 區域設備選擇頁 (/area/:id/devices)
          → 點擊設備 → 檢查表單
```

**關鍵路由定義** (`src/router/index.js`)：
```javascript
{
  path: '/area/:areaId/devices',
  name: 'area-device-selector',
  component: () => import('../views/AreaDeviceSelector.vue')
},
{
  path: '/area/:areaId/:deviceType/:frequency/:equipmentId/inspect',
  name: 'area-inspection-form',
  component: () => import('../views/InspectionForm.vue') // 重用檢查表單
}
```

### 重要更新歷史 (2025-12)

### 1. 區域檢查系統與 CSV 優化 (2025-12-30)
- **中央配置化**：引入 `類別配置.csv` 統一管理所有類別與頻率。
- **區域多設備架構**：
  - 新增 `AreaDeviceSelector.vue` 支援一個區域內多台同類設備（如兩台事務機）。
  - 透過 `區域設備詳細清單.csv` 自動推斷區域內容，移除冗餘的 `設備清單.csv`。
- **導航優化**：
  - 修復 Back 按鈕邏輯，區域檢查時返回設備選擇頁而非首頁。
  - 統一「必須掃描」邏輯：區域卡片點擊時也會提示掃描 QR Code。
- **資料清理**：移除重複的「事務機」類別，統一併入區域檢查。

### 2. 頻率管理系統
- **多頻率支援**：支援 每週/每月/每季/雙週/每日 等多種頻率。
- **自動計算**：`equipment.js` 根據頻率自動計算本期是否已檢查（例如每週檢查會檢查本週一到今天）。

### 3. CSV 載入優化
- **BOM 處理**：`csvLoader.js` 自動移除 UTF-8 BOM，防止欄位名稱解析錯誤。
- **動態類別加載**：不再硬編碼類別列表，完全由 CSV 控制。

## 開發注意事項

### 新增設備類別

若需新增設備類別，請按以下步驟：

1. **更新類別配置**：
   - 在 `public/檢點表/類別配置.csv` 新增一行
   - 指定 ID、名稱、圖示、頻率

2. **準備資料**：
   - 如果是獨立設備（如滅火器）：建立資料夾和 `設備清單.csv` + `檢點項目.csv`
   - 如果是區域內設備：更新 `區域/設備配置.csv` 和 `區域/區域設備詳細清單.csv`

3. **無需修改程式碼**：系統會自動讀取配置並顯示。

### 常見問題與修正

#### 問題：QR Code 掃描找不到區域
**原因**：區域 ID 未載入到 equipment store
**修正**：系統現在會自動讀取 `區域設備詳細清單.csv` 並將所有 Unique Area ID 註冊為設備，確保掃描器能識別。

#### 問題：CSV 解析欄位錯誤
**原因**：Excel 存檔帶有 BOM
**修正**：`csvLoader.js` 已內建 BOM 移除功能，但建議存檔時仍選擇 UTF-8 編碼。
