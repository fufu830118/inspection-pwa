"""
Microsoft Teams 通知服務
使用 Power Automate Webhook 發送訊息
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Teams Webhook URL（從環境變數讀取）
TEAMS_WEBHOOK_URL = os.getenv('TEAMS_WEBHOOK_URL', '')

def send_teams_message(webhook_url, title, message, color='0078D4', facts=None):
    """
    發送訊息到 Teams

    Args:
        webhook_url: Teams Webhook URL
        title: 訊息標題
        message: 訊息內容
        color: 顏色代碼（預設藍色）
        facts: 額外資訊列表 [{"name": "欄位名", "value": "值"}]

    Returns:
        dict: 發送結果
    """
    try:
        # Adaptive Card 格式
        card = {
            "type": "message",
            "attachments": [
                {
                    "contentType": "application/vnd.microsoft.card.adaptive",
                    "content": {
                        "type": "AdaptiveCard",
                        "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                        "version": "1.4",
                        "body": [
                            {
                                "type": "Container",
                                "style": "emphasis",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": title,
                                        "weight": "bolder",
                                        "size": "large",
                                        "color": "accent"
                                    }
                                ]
                            },
                            {
                                "type": "TextBlock",
                                "text": message,
                                "wrap": True,
                                "spacing": "medium"
                            }
                        ]
                    }
                }
            ]
        }

        # 加入額外資訊
        if facts:
            fact_set = {
                "type": "FactSet",
                "facts": facts,
                "spacing": "medium"
            }
            card["attachments"][0]["content"]["body"].append(fact_set)

        # 加入時間戳記
        card["attachments"][0]["content"]["body"].append({
            "type": "TextBlock",
            "text": f"發送時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "size": "small",
            "color": "default",
            "isSubtle": True,
            "spacing": "medium"
        })

        # 發送請求
        response = requests.post(
            webhook_url,
            json=card,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )

        if response.status_code in [200, 202]:
            return {
                'success': True,
                'message': 'Teams 通知已成功發送'
            }
        else:
            return {
                'success': False,
                'message': f'發送失敗: {response.status_code} - {response.text}'
            }

    except Exception as e:
        return {
            'success': False,
            'message': f'發送失敗: {str(e)}'
        }

@app.route('/api/teams/test', methods=['GET'])
def test_teams_notification():
    """測試 Teams 通知"""
    result = send_teams_message(
        webhook_url=TEAMS_WEBHOOK_URL,
        title='🔔 設備巡檢系統 - 測試通知',
        message='這是一則測試訊息，確認 Teams Webhook 設定是否正確。',
        facts=[
            {"name": "系統", "value": "設備巡檢 PWA"},
            {"name": "測試項目", "value": "Teams 通知功能"}
        ]
    )

    return jsonify(result), 200 if result['success'] else 500

@app.route('/api/teams/expiry-alert', methods=['POST'])
def send_expiry_alert():
    """
    發送設備到期提醒到 Teams

    Request Body:
    {
        "equipment_id": "A23A1-01-1",
        "equipment_name": "乾粉滅火器 20型",
        "location": "A23FA1區",
        "expiry_date": "2027/10/26",
        "webhook_url": "https://..." // 選用，可覆蓋預設
    }
    """
    try:
        data = request.json
        webhook_url = data.get('webhook_url', TEAMS_WEBHOOK_URL)

        if not webhook_url:
            return jsonify({'error': '未設定 Webhook URL'}), 400

        result = send_teams_message(
            webhook_url=webhook_url,
            title='⚠️ 設備即將到期提醒',
            message=f'設備 **{data["equipment_id"]}** 即將到期，請及時安排更換或維護作業。',
            color='FFB900',  # 黃色警告
            facts=[
                {"name": "設備編號", "value": data['equipment_id']},
                {"name": "設備名稱", "value": data['equipment_name']},
                {"name": "所在位置", "value": data['location']},
                {"name": "到期日期", "value": data['expiry_date']}
            ]
        )

        return jsonify(result), 200 if result['success'] else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams/inspection-reminder', methods=['POST'])
def send_inspection_reminder():
    """
    發送檢查提醒到 Teams

    Request Body:
    {
        "category": "滅火器",
        "pending_count": 15,
        "total_count": 128,
        "webhook_url": "https://..." // 選用
    }
    """
    try:
        data = request.json
        webhook_url = data.get('webhook_url', TEAMS_WEBHOOK_URL)

        if not webhook_url:
            return jsonify({'error': '未設定 Webhook URL'}), 400

        percentage = ((data['total_count'] - data['pending_count']) / data['total_count']) * 100

        result = send_teams_message(
            webhook_url=webhook_url,
            title='📋 每月檢查進度提醒',
            message=f'**{data["category"]}** 類別還有 **{data["pending_count"]}** 項設備待檢查，請及時完成本月檢查作業。',
            color='0078D4',  # 藍色
            facts=[
                {"name": "類別", "value": data['category']},
                {"name": "待檢查", "value": f"{data['pending_count']}/{data['total_count']}"},
                {"name": "完成率", "value": f"{percentage:.1f}%"}
            ]
        )

        return jsonify(result), 200 if result['success'] else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams/inspection-abnormal', methods=['POST'])
def send_abnormal_alert():
    """
    發送異常設備通知到 Teams

    Request Body:
    {
        "equipment_id": "A23A1-01-1",
        "equipment_name": "乾粉滅火器 20型",
        "location": "A23FA1區",
        "inspector": "王小明",
        "issues": ["壓力異常", "外觀損壞"],
        "webhook_url": "https://..." // 選用
    }
    """
    try:
        data = request.json
        webhook_url = data.get('webhook_url', TEAMS_WEBHOOK_URL)

        if not webhook_url:
            return jsonify({'error': '未設定 Webhook URL'}), 400

        issues_text = "\n".join([f"• {issue}" for issue in data['issues']])

        result = send_teams_message(
            webhook_url=webhook_url,
            title='🚨 發現異常設備！',
            message=f'設備 **{data["equipment_id"]}** 檢查發現異常，請立即處理。\n\n**異常項目：**\n{issues_text}',
            color='E81123',  # 紅色警告
            facts=[
                {"name": "設備編號", "value": data['equipment_id']},
                {"name": "設備名稱", "value": data['equipment_name']},
                {"name": "所在位置", "value": data['location']},
                {"name": "檢查人員", "value": data['inspector']}
            ]
        )

        return jsonify(result), 200 if result['success'] else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/teams/custom', methods=['POST'])
def send_custom_message():
    """
    發送自訂訊息到 Teams

    Request Body:
    {
        "title": "訊息標題",
        "message": "訊息內容",
        "webhook_url": "https://..." // 選用
    }
    """
    try:
        data = request.json
        webhook_url = data.get('webhook_url', TEAMS_WEBHOOK_URL)

        if not webhook_url:
            return jsonify({'error': '未設定 Webhook URL'}), 400

        result = send_teams_message(
            webhook_url=webhook_url,
            title=data.get('title', '💬 訊息通知'),
            message=data.get('message', ''),
            color='0078D4'
        )

        return jsonify(result), 200 if result['success'] else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康檢查"""
    return jsonify({
        'status': 'ok',
        'service': 'Teams Notifier',
        'webhook_configured': bool(TEAMS_WEBHOOK_URL),
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print('Teams Notifier Server starting...')
    print(f'Webhook URL configured: {"Yes" if TEAMS_WEBHOOK_URL else "No"}')
    app.run(host='0.0.0.0', port=5001, debug=True)
