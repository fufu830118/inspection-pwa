"""
發送自訂訊息到 Teams
"""

import requests
import json

url = 'http://localhost:5001/api/teams/custom'

data = {
    'title': '💬 海苔訊息',
    'message': '我現在我去拿海苔可以麼，玉米濃湯口味明天可以試試看的\n\nby michael'
}

response = requests.post(url, json=data)
print(f'狀態: {response.status_code}')
print(f'回應: {response.json()}')
