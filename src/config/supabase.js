import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// TODO: 請到 Supabase 專案設定中取得這些值
// 1. 到 https://supabase.com/dashboard 建立新專案
// 2. 到 Project Settings > API 取得以下資訊
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// 建立 Supabase 客戶端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 檢查連線狀態
export async function checkConnection() {
  try {
    const { error } = await supabase.from('inspection_categories').select('count')
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.error('Supabase connection error:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
}
