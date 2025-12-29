# Email Server - 設備巡檢系統郵件服務

Python Flask 後端服務，負責處理 SMTP 郵件發送。

## 安裝

```bash
# 建立虛擬環境（推薦）
python -m venv venv

# 啟動虛擬環境
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 安裝相依套件
pip install -r requirements.txt
```

## 設定

複製 `.env.example` 為 `.env` 並設定 SMTP 資訊：

```bash
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_USER=michael@wiwynn.com
SMTP_PASSWORD=your_password
```

## 啟動

```bash
python app.py
```

伺服器會在 `http://localhost:5000` 啟動

## API 端點

### 1. 測試郵件發送
```bash
GET http://localhost:5000/api/test-email
```

### 2. 發送一般郵件
```bash
POST http://localhost:5000/api/send-email
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "郵件主旨",
  "body": "郵件內容",
  "html": "<html>...</html>"  // 選用
}
```

### 3. 發送設備到期提醒
```bash
POST http://localhost:5000/api/send-expiry-alert
Content-Type: application/json

{
  "equipment_id": "A23A1-01-1",
  "equipment_name": "乾粉滅火器 20型",
  "location": "A23FA1區",
  "expiry_date": "2027/10/26",
  "to": "michael@wiwynn.com"
}
```

### 4. 發送檢查提醒
```bash
POST http://localhost:5000/api/send-inspection-reminder
Content-Type: application/json

{
  "to": "michael@wiwynn.com",
  "category": "滅火器",
  "pending_count": 15,
  "total_count": 128
}
```

## 整合到前端

在 Vue 前端呼叫 API：

```javascript
// 發送到期提醒
async function sendExpiryAlert(equipment) {
  const response = await fetch('http://localhost:5000/api/send-expiry-alert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      equipment_id: equipment.id,
      equipment_name: equipment.name,
      location: equipment.location,
      expiry_date: equipment.expiryDate,
      to: 'michael@wiwynn.com'
    })
  })

  const result = await response.json()
  console.log(result)
}
```

## 部署

可部署到：
- Azure App Service (Python)
- Heroku
- Google Cloud Run
- Docker Container
