# -*- coding: utf-8 -*-
"""
合併設備清單和詳細清單
保留所有資料，智能合併欄位
"""
import os
import csv
import codecs

def merge_equipment_files(category_path, category_name):
    """合併設備清單和詳細清單"""
    equipment_file = os.path.join(category_path, '設備清單.csv')
    detail_file_candidates = [
        os.path.join(category_path, f'{category_name}詳細清單.csv'),
        os.path.join(category_path, '詳細清單.csv')
    ]
    
    detail_file = None
    for candidate in detail_file_candidates:
        if os.path.exists(candidate):
            detail_file = candidate
            break
    
    if not detail_file:
        print(f"    沒有詳細清單，跳過合併")
        return
    
    # 讀取設備清單
    with codecs.open(equipment_file, 'r', 'utf-8-sig') as f:
        equipment_reader = csv.DictReader(f)
        equipment_data = {row.get('編碼顯示') or row.get('設備ID'): row for row in equipment_reader}
        equipment_headers = equipment_reader.fieldnames
    
    # 讀取詳細清單
    with codecs.open(detail_file, 'r', 'utf-8-sig') as f:
        detail_reader = csv.DictReader(f)
        detail_data = {row.get('編號') or row.get('設備ID'): row for row in detail_reader}
        detail_headers = detail_reader.fieldnames
    
    # 合併欄位（固定欄位 + 詳細資訊）
    new_headers = ['設備ID', 'QR碼']
    
    # 從詳細清單加入有用的欄位
    useful_fields = []
    for header in detail_headers:
        if header not in ['編號', '設備ID', 'QR碼', '條碼內容', '最後檢點日期']:
            useful_fields.append(header)
    
    new_headers.extend(useful_fields)
    
    # 合併資料
    merged_rows = []
    for equipment_id, equip_row in equipment_data.items():
        detail_row = detail_data.get(equipment_id, {})
        
        merged_row = {
            '設備ID': equipment_id,
            'QR碼': equip_row.get('亂碼') or equip_row.get('QR碼', '')
        }
        
        # 加入詳細資訊
        for field in useful_fields:
            merged_row[field] = detail_row.get(field, '')
        
        merged_rows.append(merged_row)
    
    # 寫回設備清單（使用 UTF-8 with BOM）
    with codecs.open(equipment_file, 'w', 'utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=new_headers, lineterminator='\n')
        writer.writeheader()
        writer.writerows(merged_rows)
    
    print(f"    ✅ 合併完成：{len(merged_rows)} 筆設備，{len(new_headers)} 個欄位")
    print(f"    欄位：{', '.join(new_headers)}")
    
    # 刪除詳細清單
    os.remove(detail_file)
    print(f"    🗑️  已刪除：{os.path.basename(detail_file)}")

def simplify_inspection_headers(file_path):
    """簡化檢點項目標題"""
    with codecs.open(file_path, 'r', 'utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        old_headers = reader.fieldnames
    
    # 欄位對應
    header_map = {
        '項目名稱': '檢查項目',
        '題型': '欄位類型',
        '檢查重點': '說明',
        '正常標準': '合格條件',
        '異常標準': '不合格條件',
        '必填': '必填'
    }
    
    new_headers = [header_map.get(h, h) for h in old_headers]
    
    # 寫回檔案（使用 UTF-8 with BOM）
    with codecs.open(file_path, 'w', 'utf-8-sig') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerow(new_headers)
        
        for row in rows:
            new_row = [row[old_h] for old_h in old_headers]
            writer.writerow(new_row)
    
    return len(rows), new_headers

def main():
    base_path = 'public/檢點表'
    
    categories = [d for d in os.listdir(base_path) 
                  if os.path.isdir(os.path.join(base_path, d))]
    
    print(f"找到 {len(categories)} 個類別資料夾\n")
    
    for category in categories:
        category_path = os.path.join(base_path, category)
        print(f"=== {category} ===")
        
        # 1. 合併設備清單和詳細清單
        merge_equipment_files(category_path, category)
        
        # 2. 簡化檢點項目標題
        inspection_file = os.path.join(category_path, '檢點項目.csv')
        if os.path.exists(inspection_file):
            count, headers = simplify_inspection_headers(inspection_file)
            print(f"    ✅ 檢點項目：{count} 筆，欄位：{', '.join(headers)}")
        
        # 3. 刪除頻率.csv
        frequency_file = os.path.join(category_path, '頻率.csv')
        if os.path.exists(frequency_file):
            os.remove(frequency_file)
            print(f"    🗑️  已刪除：頻率.csv")
        
        print()
    
    print("✅ 所有檔案處理完成！")

if __name__ == '__main__':
    main()
