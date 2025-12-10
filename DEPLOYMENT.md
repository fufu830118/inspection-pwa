# Azure 部署檢查清單

## 前置作業

- [ ] 取得 Azure 訂閱存取權限
- [ ] 確認 OAuth Client ID 和 Secret
- [ ] 準備 GitHub 或 Azure DevOps 儲存庫

## 部署步驟

### 1. Azure 資源建立
- [ ] 建立 Static Web App 資源
- [ ] 設定自訂網域（選用）
- [ ] 設定 SSL 憑證（自動）

### 2. 環境變數設定
- [ ] `VITE_OAUTH_CLIENT_ID`
- [ ] `VITE_OAUTH_CLIENT_SECRET`
- [ ] `VITE_OAUTH_AUTHORIZE_URL`
- [ ] `VITE_OAUTH_TOKEN_URL`
- [ ] `VITE_OAUTH_USERINFO_URL`

### 3. OAuth 設定
- [ ] 在 Wiwynn OAuth Portal 註冊 Redirect URI
  - 格式：`https://<azure-domain>/auth/callback`

### 4. 網路設定
- [ ] 確認 HTTPS 已啟用
- [ ] 測試 CORS proxy 設定
- [ ] 確認防火牆規則（如有）

### 5. 測試驗證
- [ ] 電腦瀏覽器測試登入
- [ ] 手機瀏覽器測試登入
- [ ] QR Code 掃描測試（需要 HTTPS）
- [ ] 檢查表單提交測試
- [ ] 歷史紀錄查詢測試

### 6. 監控設定
- [ ] 啟用 Application Insights
- [ ] 設定警報規則
- [ ] 設定日誌保留期限

## 常見問題處理

### OAuth 登入失敗
**問題**：redirect_uri 不符
**解決**：檢查 OAuth Portal 註冊的 URI 是否與部署網域一致

### 相機無法啟動
**問題**：非 HTTPS 連線
**解決**：確認 Azure Static Web Apps 的 HTTPS 已啟用

### 路由 404 錯誤
**問題**：SPA 路由未正確設定
**解決**：確認 `staticwebapp.config.json` 已正確配置

## 技術支援聯絡資訊

- 開發者：Michael Wang
- 專案儲存庫：[GitHub URL]
- 技術文件：CLAUDE.md

## 部署後驗證清單

- [ ] 訪問首頁正常顯示
- [ ] OAuth 登入流程完整
- [ ] QR Code 掃描功能正常
- [ ] 檢查表單可正常填寫與送出
- [ ] 歷史紀錄可查詢與匯出 CSV
- [ ] 手機版介面正常運作
- [ ] 效能測試（Lighthouse Score > 90）

---

**最後更新**：2025-12-10
**版本**：1.0.0
