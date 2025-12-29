# Teams Webhook 設定指南

## 📋 設定步驟

### 1. 建立 Power Automate Workflow

1. 登入 **Power Automate** (https://make.powerautomate.com)
2. 點擊「建立」→「自動化雲端流程」
3. 選擇觸發程序：**「收到 HTTP 要求時」**

### 2. 設定 HTTP 觸發器

在觸發器中設定：

**要求本文 JSON 結構描述**（選用）：
```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string"
    },
    "attachments": {
      "type": "array"
    }
  }
}
```

### 3. 新增 Teams 動作

1. 點擊「新增步驟」
2. 搜尋「Teams」
3. 選擇「張貼 Adaptive Card 到 Teams 頻道」或「張貼訊息」

**設定**：
- **Team**: 選擇你的團隊
- **Channel**: 選擇要發送的頻道（例如「一般」）
- **Message**: 使用動態內容 → `本文`

### 4. 儲存並取得 Webhook URL

1. 點擊「儲存」
2. 點擊 HTTP 觸發器展開
3. 複製「HTTP POST URL」

範例 URL：
```
https://prod-xx.location.logic.azure.com/workflows/xxxxx/triggers/manual/paths/invoke?...
```

### 5. 設定環境變數

將 Webhook URL 加入 `.env` 檔案：

```bash
TEAMS_WEBHOOK_URL=https://your-webhook-url-here
```

## 🚀 測試 Teams 通知

### 啟動伺服器

```bash
cd email-server
python teams_notifier.py
```

伺服器會在 `http://localhost:5001` 啟動

### 測試 API

#### 1. 測試基本通知
```bash
curl http://localhost:5001/api/teams/test
```

#### 2. 發送設備到期提醒
```bash
curl -X POST http://localhost:5001/api/teams/expiry-alert \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "A23A1-01-1",
    "equipment_name": "乾粉滅火器 20型",
    "location": "A23FA1區",
    "expiry_date": "2027/10/26"
  }'
```

#### 3. 發送檢查提醒
```bash
curl -X POST http://localhost:5001/api/teams/inspection-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "category": "滅火器",
    "pending_count": 15,
    "total_count": 128
  }'
```

#### 4. 發送異常設備通知
```bash
curl -X POST http://localhost:5001/api/teams/inspection-abnormal \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "A23A1-01-1",
    "equipment_name": "乾粉滅火器 20型",
    "location": "A23FA1區",
    "inspector": "王小明",
    "issues": ["壓力異常", "外觀損壞"]
  }'
```

## 🎨 Adaptive Card 訊息格式

Teams 會收到美觀的卡片式訊息，包含：

- ✅ 彩色標題（藍/黃/紅，依類型而定）
- ✅ 清楚的訊息內容
- ✅ 結構化的資料表（設備資訊）
- ✅ 時間戳記

## 🔧 整合到前端

在 Vue 前端呼叫 API：

```javascript
// 發送到期提醒
async function sendExpiryAlert(equipment) {
  const response = await fetch('http://localhost:5001/api/teams/expiry-alert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      equipment_id: equipment.id,
      equipment_name: equipment.name,
      location: equipment.location,
      expiry_date: equipment.expiryDate
    })
  })

  const result = await response.json()
  console.log(result)
}

// 發送異常通知（檢查表單送出時）
async function sendAbnormalAlert(equipment, inspector, issues) {
  await fetch('http://localhost:5001/api/teams/inspection-abnormal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      equipment_id: equipment.id,
      equipment_name: equipment.name,
      location: equipment.location,
      inspector: inspector.name,
      issues: issues
    })
  })
}
```

## 📱 多個 Webhook URL

如果需要發送到不同頻道：

```javascript
// 緊急異常 → 主管頻道
await fetch('/api/teams/inspection-abnormal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...data,
    webhook_url: 'https://webhook-for-managers'
  })
})

// 一般提醒 → 一般頻道
await fetch('/api/teams/inspection-reminder', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...data,
    webhook_url: 'https://webhook-for-general'
  })
})
```

## 🎯 優點

相比 SMTP：
- ✅ 不需要郵件密碼
- ✅ 更安全（只有 Webhook URL）
- ✅ 原生 Teams 整合
- ✅ 美觀的 Adaptive Card
- ✅ 可直接在 Teams 回覆
- ✅ 通知更即時

## 🔐 安全性

- Webhook URL 包含 token，請妥善保管
- 不要提交到 Git（已加入 .gitignore）
- 可在 Power Automate 設定 IP 白名單

## 📚 參考資源

- [Power Automate 文件](https://learn.microsoft.com/zh-tw/power-automate/)
- [Adaptive Cards 設計工具](https://adaptivecards.io/designer/)
- [Teams Webhook 說明](https://learn.microsoft.com/zh-tw/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)
