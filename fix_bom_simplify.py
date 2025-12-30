import os

files = [
    r"c:\Users\f2302\Desktop\檢點系統\inspection-pwa\public\檢點表\主管座車\設備清單.csv",
    r"c:\Users\f2302\Desktop\檢點系統\inspection-pwa\public\檢點表\一般車輛\設備清單.csv"
]

for fpath in files:
    try:
        if os.path.exists(fpath):
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            with open(fpath, 'w', encoding='utf-8-sig') as f:
                f.write(content)
            print(f"Fixed BOM for: {fpath}")
        else:
            print(f"File not found: {fpath}")
    except Exception as e:
        print(f"Error processing {fpath}: {e}")
