-- 巡檢系統資料庫 Schema
-- 執行此 SQL 於 Supabase SQL Editor 中

-- 1. 檢查類別表
CREATE TABLE IF NOT EXISTS inspection_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  id_prefix VARCHAR(20) NOT NULL UNIQUE, -- QR Code 前綴 (例如: FIRE, AUTO)
  icon VARCHAR(10),
  frequency VARCHAR(50), -- 檢查頻率 (例如: 每月, 每季)
  form_config JSONB NOT NULL, -- 動態表單配置
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 設備表
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id VARCHAR(50) NOT NULL UNIQUE, -- 設備編號 (例如: FIRE-001)
  category_id UUID NOT NULL REFERENCES inspection_categories(id),
  location VARCHAR(200), -- 設備位置
  installation_date DATE, -- 安裝日期
  last_maintenance_date DATE, -- 最後維護日期
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 檢查紀錄表
CREATE TABLE IF NOT EXISTS inspection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id VARCHAR(50) NOT NULL, -- 設備編號
  category_id UUID NOT NULL REFERENCES inspection_categories(id),
  inspector_id VARCHAR(100), -- OAuth user ID
  inspector_name VARCHAR(100) NOT NULL,
  inspector_email VARCHAR(200) NOT NULL,
  inspection_data JSONB NOT NULL, -- 檢查表單資料
  notes TEXT, -- 備註
  status VARCHAR(20) NOT NULL CHECK (status IN ('pass', 'fail')), -- pass: 合格, fail: 異常
  photos TEXT[], -- 照片 URLs (未來功能)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(is_active);
CREATE INDEX IF NOT EXISTS idx_inspection_logs_equipment ON inspection_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_inspection_logs_category ON inspection_logs(category_id);
CREATE INDEX IF NOT EXISTS idx_inspection_logs_created ON inspection_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inspection_logs_inspector ON inspection_logs(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspection_logs_status ON inspection_logs(status);

-- 啟用 Row Level Security (RLS)
ALTER TABLE inspection_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_logs ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策 (允許所有認證用戶讀取)
-- 檢查類別: 所有人可讀
CREATE POLICY "Allow read access to all authenticated users"
  ON inspection_categories FOR SELECT
  TO authenticated
  USING (true);

-- 設備: 所有人可讀，僅管理員可寫
CREATE POLICY "Allow read access to all authenticated users"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 檢查紀錄: 所有人可讀和新增
CREATE POLICY "Allow read access to all authenticated users"
  ON inspection_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON inspection_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 插入初始檢查類別資料
INSERT INTO inspection_categories (name, id_prefix, icon, frequency, form_config) VALUES
  ('滅火器', 'FIRE', '🧯', '每月', '{
    "fields": [
      {"id": "appearance", "label": "瓶身外觀是否無鏽蝕狀況", "type": "checkbox", "required": true},
      {"id": "pressure", "label": "壓力指示值是否在有效範圍(綠色)內", "type": "checkbox", "required": true},
      {"id": "parts", "label": "插梢、壓把、皮管、噴嘴是否正常", "type": "checkbox", "required": true},
      {"id": "expiry", "label": "滅火器是否於有效日期內", "type": "checkbox", "required": true},
      {"id": "label", "label": "手持式滅火器是否有標示牌與專用放置盒", "type": "checkbox", "required": true},
      {"id": "obstruction", "label": "滅火器是否無雜物遮擋", "type": "checkbox", "required": true},
      {"id": "notes", "label": "其他與問題描述 (若無則空白)", "type": "textarea", "required": false}
    ]
  }'),
  ('自動門', 'AUTO', '🚪', '每半年', '{
    "fields": [
      {"id": "appearance", "label": "外觀是否無破損", "type": "checkbox", "required": true},
      {"id": "operation", "label": "開關是否無異音及正常開關", "type": "checkbox", "required": true},
      {"id": "access_control", "label": "門禁測試是否正常", "type": "checkbox", "required": true},
      {"id": "track", "label": "上軌道是否清潔", "type": "checkbox", "required": true},
      {"id": "safety", "label": "防夾功能是否正常", "type": "checkbox", "required": true},
      {"id": "power", "label": "電源功能是否正常", "type": "checkbox", "required": true},
      {"id": "notes", "label": "其他與問題描述 (若無則空白)", "type": "textarea", "required": false}
    ]
  }'),
  ('防火鐵捲門', 'DOOR', '🔥', '每半年', '{
    "fields": [
      {"id": "appearance", "label": "外觀是否無破損", "type": "checkbox", "required": true},
      {"id": "operation", "label": "開關是否無異音及正常開關", "type": "checkbox", "required": true},
      {"id": "track", "label": "上軌道是否清潔", "type": "checkbox", "required": true},
      {"id": "power", "label": "電源功能是否正常", "type": "checkbox", "required": true},
      {"id": "notes", "label": "其他與問題描述", "type": "textarea", "required": false}
    ]
  }'),
  ('逃生門', 'EXIT', '🚨', '每季', '{
    "fields": [
      {"id": "lock", "label": "門鎖是否正常可開啟", "type": "checkbox", "required": true},
      {"id": "obstruction", "label": "逃生門是否無物品阻擋", "type": "checkbox", "required": true},
      {"id": "sign", "label": "逃生標示是否正常", "type": "checkbox", "required": true},
      {"id": "notes", "label": "其他與問題描述", "type": "textarea", "required": false}
    ]
  }'),
  ('會議室', 'ROOM', '🏢', '每日', '{
    "fields": [
      {"id": "cleanliness", "label": "會議室整潔度", "type": "radio", "options": ["優良", "普通", "需改善"], "required": true},
      {"id": "equipment", "label": "設備功能正常", "type": "checkbox", "required": true},
      {"id": "ac", "label": "空調運作正常", "type": "checkbox", "required": true},
      {"id": "notes", "label": "備註", "type": "textarea", "required": false}
    ]
  }'),
  ('沖眼器', 'EYE', '👁️', '每月', '{
    "fields": [
      {"id": "water_flow", "label": "水流是否正常", "type": "checkbox", "required": true},
      {"id": "cleanliness", "label": "外觀是否清潔", "type": "checkbox", "required": true},
      {"id": "notes", "label": "備註", "type": "textarea", "required": false}
    ]
  }')
ON CONFLICT (id_prefix) DO NOTHING;

-- 建立更新時間戳的函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 建立觸發器以自動更新 updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON inspection_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
  BEFORE UPDATE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 建立視圖: 檢查統計
CREATE OR REPLACE VIEW inspection_stats AS
SELECT
  c.name AS category_name,
  COUNT(l.id) AS total_inspections,
  COUNT(CASE WHEN l.status = 'pass' THEN 1 END) AS passed_inspections,
  COUNT(CASE WHEN l.status = 'fail' THEN 1 END) AS failed_inspections,
  ROUND(
    COUNT(CASE WHEN l.status = 'pass' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(l.id), 0) * 100,
    2
  ) AS pass_rate
FROM inspection_categories c
LEFT JOIN inspection_logs l ON c.id = l.category_id
GROUP BY c.id, c.name;

-- 建立視圖: 最近檢查
CREATE OR REPLACE VIEW recent_inspections AS
SELECT
  l.id,
  l.equipment_id,
  c.name AS category_name,
  c.icon AS category_icon,
  l.inspector_name,
  l.status,
  l.notes,
  l.created_at
FROM inspection_logs l
JOIN inspection_categories c ON l.category_id = c.id
ORDER BY l.created_at DESC
LIMIT 100;
