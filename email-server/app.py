"""
SMTP Email Server - 設備巡檢系統郵件服務
支援自動提醒通知功能
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

app = Flask(__name__)
CORS(app)  # 允許前端跨域請求

# SMTP 配置
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.office365.com')  # Wiwynn 可能使用 Office 365
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', 'michael@wiwynn.com')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')

def send_email(to_email, subject, body, html_body=None):
    """
    發送郵件

    Args:
        to_email: 收件人信箱
        subject: 郵件主旨
        body: 純文字內容
        html_body: HTML 格式內容（選用）

    Returns:
        dict: 發送結果
    """
    try:
        # 建立郵件
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        # 加入純文字內容
        text_part = MIMEText(body, 'plain', 'utf-8')
        msg.attach(text_part)

        # 加入 HTML 內容（如果有）
        if html_body:
            html_part = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(html_part)

        # 連接 SMTP 伺服器
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # 啟用 TLS 加密
        server.login(SMTP_USER, SMTP_PASSWORD)

        # 發送郵件
        server.send_message(msg)
        server.quit()

        return {
            'success': True,
            'message': f'郵件已成功發送至 {to_email}'
        }

    except Exception as e:
        return {
            'success': False,
            'message': f'郵件發送失敗: {str(e)}'
        }

@app.route('/api/send-email', methods=['POST'])
def api_send_email():
    """
    API: 發送郵件

    Request Body:
    {
        "to": "recipient@example.com",
        "subject": "郵件主旨",
        "body": "郵件內容",
        "html": "<html>...</html>"  // 選用
    }
    """
    try:
        data = request.json

        # 驗證必要欄位
        if not data.get('to'):
            return jsonify({'error': '缺少收件人信箱'}), 400
        if not data.get('subject'):
            return jsonify({'error': '缺少郵件主旨'}), 400
        if not data.get('body'):
            return jsonify({'error': '缺少郵件內容'}), 400

        # 發送郵件
        result = send_email(
            to_email=data['to'],
            subject=data['subject'],
            body=data['body'],
            html_body=data.get('html')
        )

        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-email', methods=['GET'])
def test_email():
    """
    測試郵件發送
    """
    result = send_email(
        to_email='michael@wiwynn.com',
        subject='🔔 設備巡檢系統 - 測試郵件',
        body='這是一封測試郵件，確認 SMTP 設定是否正確。',
        html_body='''
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2 style="color: #2563eb;">設備巡檢系統 - 測試郵件</h2>
                <p>這是一封測試郵件，確認 SMTP 設定是否正確。</p>
                <p>發送時間：''' + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + '''</p>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    此郵件由設備巡檢系統自動發送
                </p>
            </body>
        </html>
        '''
    )

    return jsonify(result), 200 if result['success'] else 500

@app.route('/api/send-expiry-alert', methods=['POST'])
def send_expiry_alert():
    """
    發送設備到期提醒

    Request Body:
    {
        "equipment_id": "A23A1-01-1",
        "equipment_name": "乾粉滅火器 20型",
        "location": "A23FA1區",
        "expiry_date": "2027/10/26",
        "to": "michael@wiwynn.com"
    }
    """
    try:
        data = request.json

        subject = f"⚠️ 設備即將到期提醒 - {data['equipment_id']}"

        body = f"""
設備到期提醒通知

設備編號：{data['equipment_id']}
設備名稱：{data['equipment_name']}
所在位置：{data['location']}
到期日期：{data['expiry_date']}

請及時安排更換或維護作業。

此為系統自動通知郵件
        """

        html_body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; color: white;">
                    <h2 style="margin: 0;">⚠️ 設備即將到期提醒</h2>
                </div>
                <div style="padding: 20px; background: #f9fafb;">
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #1f2937; margin-top: 0;">設備資訊</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; color: #6b7280; width: 100px;">設備編號</td>
                                <td style="padding: 8px; font-weight: bold;">{data['equipment_id']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; color: #6b7280;">設備名稱</td>
                                <td style="padding: 8px; font-weight: bold;">{data['equipment_name']}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; color: #6b7280;">所在位置</td>
                                <td style="padding: 8px; font-weight: bold;">{data['location']}</td>
                            </tr>
                            <tr style="background: #fef2f2;">
                                <td style="padding: 8px; color: #6b7280;">到期日期</td>
                                <td style="padding: 8px; font-weight: bold; color: #dc2626;">{data['expiry_date']}</td>
                            </tr>
                        </table>
                        <p style="margin-top: 20px; padding: 12px; background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b;">
                            ⚠️ 請及時安排更換或維護作業
                        </p>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>此為系統自動通知郵件，請勿回覆</p>
                    <p>發送時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </body>
        </html>
        '''

        result = send_email(
            to_email=data['to'],
            subject=subject,
            body=body,
            html_body=html_body
        )

        return jsonify(result), 200 if result['success'] else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/send-inspection-reminder', methods=['POST'])
def send_inspection_reminder():
    """
    發送檢查提醒

    Request Body:
    {
        "to": "michael@wiwynn.com",
        "category": "滅火器",
        "pending_count": 15,
        "total_count": 128
    }
    """
    try:
        data = request.json

        subject = f"📋 每月檢查提醒 - {data['category']}"

        body = f"""
每月檢查提醒通知

類別：{data['category']}
待檢查數量：{data['pending_count']}/{data['total_count']}

請及時完成本月設備檢查作業。

此為系統自動通知郵件
        """

        html_body = f'''
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; color: white;">
                    <h2 style="margin: 0;">📋 每月檢查提醒</h2>
                </div>
                <div style="padding: 20px; background: #f9fafb;">
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                        <h3 style="color: #1f2937; margin-top: 0;">檢查進度</h3>
                        <p><strong>類別：</strong>{data['category']}</p>
                        <p><strong>待檢查：</strong><span style="color: #ef4444; font-size: 24px; font-weight: bold;">{data['pending_count']}</span> / {data['total_count']}</p>
                        <div style="background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0;">
                            <div style="background: #3b82f6; height: 100%; width: {((data['total_count'] - data['pending_count']) / data['total_count'] * 100):.1f}%;"></div>
                        </div>
                        <p style="margin-top: 20px; padding: 12px; background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af;">
                            📌 請及時完成本月設備檢查作業
                        </p>
                    </div>
                </div>
                <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>此為系統自動通知郵件，請勿回覆</p>
                    <p>發送時間：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </body>
        </html>
        '''

        result = send_email(
            to_email=data['to'],
            subject=subject,
            body=body,
            html_body=html_body
        )

        return jsonify(result), 200 if result['success'] else 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """健康檢查"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    import sys
    import io
    # 設定 UTF-8 編碼輸出
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print('Email Server starting...')
    print(f'SMTP Server: {SMTP_SERVER}:{SMTP_PORT}')
    print(f'SMTP User: {SMTP_USER}')
    app.run(host='0.0.0.0', port=5000, debug=True)
