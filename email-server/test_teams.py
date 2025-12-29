"""
測試 Teams 通知功能
"""

import requests
import json

BASE_URL = 'http://localhost:5001'

print('=' * 60)
print('Teams 通知測試')
print('=' * 60)

# 1. 測試基本通知
print('\n1. 測試基本通知')
response = requests.get(f'{BASE_URL}/api/teams/test')
print(f'狀態: {response.status_code}')
print(f'回應: {response.json()}')

# 2. 測試設備到期提醒
print('\n2. 測試設備到期提醒')
data = {
    'equipment_id': 'A23A1-01-1',
    'equipment_name': '乾粉滅火器 20型',
    'location': 'A23FA1區',
    'expiry_date': '2027/10/26'
}
response = requests.post(
    f'{BASE_URL}/api/teams/expiry-alert',
    json=data
)
print(f'狀態: {response.status_code}')
print(f'回應: {response.json()}')

# 3. 測試檢查提醒
print('\n3. 測試檢查提醒')
data = {
    'category': '滅火器',
    'pending_count': 15,
    'total_count': 128
}
response = requests.post(
    f'{BASE_URL}/api/teams/inspection-reminder',
    json=data
)
print(f'狀態: {response.status_code}')
print(f'回應: {response.json()}')

# 4. 測試異常設備通知
print('\n4. 測試異常設備通知')
data = {
    'equipment_id': 'A23A1-01-1',
    'equipment_name': '乾粉滅火器 20型',
    'location': 'A23FA1區',
    'inspector': '王小明',
    'issues': ['壓力異常', '外觀損壞']
}
response = requests.post(
    f'{BASE_URL}/api/teams/inspection-abnormal',
    json=data
)
print(f'狀態: {response.status_code}')
print(f'回應: {response.json()}')

print('\n' + '=' * 60)
print('測試完成！請檢查 Teams 頻道是否收到 4 則通知')
print('=' * 60)
