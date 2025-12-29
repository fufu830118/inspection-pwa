"""
測試不同的 SMTP 設定
"""

import smtplib
from email.mime.text import MIMEText

# 測試配置清單
SMTP_CONFIGS = [
    # Office 365 標準設定
    {
        'name': 'Office 365 SMTP (Port 587)',
        'server': 'smtp.office365.com',
        'port': 587,
        'use_tls': True
    },
    # Office 365 SSL
    {
        'name': 'Office 365 SMTPS (Port 465)',
        'server': 'smtp.office365.com',
        'port': 465,
        'use_ssl': True
    },
    # Outlook.com
    {
        'name': 'Outlook.com SMTP',
        'server': 'smtp-mail.outlook.com',
        'port': 587,
        'use_tls': True
    },
    # Wiwynn 內部（猜測）
    {
        'name': 'Wiwynn Internal SMTP (猜測)',
        'server': 'smtp.wiwynn.com',
        'port': 587,
        'use_tls': True
    },
]

username = 'michael@wiwynn.com'
password = 'lznqjnrbbkmykhlv'

print('=' * 60)
print('SMTP 連線測試')
print('=' * 60)
print(f'帳號: {username}')
print(f'應用程式密碼: {password[:4]}...{password[-4:]}')
print('=' * 60)

for config in SMTP_CONFIGS:
    print(f"\n測試: {config['name']}")
    print(f"伺服器: {config['server']}:{config['port']}")

    try:
        if config.get('use_ssl'):
            # 使用 SSL
            server = smtplib.SMTP_SSL(config['server'], config['port'], timeout=10)
        else:
            # 使用 TLS
            server = smtplib.SMTP(config['server'], config['port'], timeout=10)
            server.ehlo()
            if config.get('use_tls'):
                server.starttls()
                server.ehlo()

        # 嘗試登入
        server.login(username, password)
        print(f"✅ 成功！可以使用此設定")

        # 測試發送
        msg = MIMEText('測試郵件', 'plain', 'utf-8')
        msg['Subject'] = '測試'
        msg['From'] = username
        msg['To'] = username

        server.send_message(msg)
        print(f"✅ 郵件發送成功！")

        server.quit()
        break  # 成功就停止

    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ 認證失敗: {e}")
    except Exception as e:
        print(f"❌ 連線失敗: {e}")

print('\n' + '=' * 60)
print('測試完成')
print('=' * 60)
