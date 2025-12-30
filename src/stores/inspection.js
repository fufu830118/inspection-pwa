import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { useCategoriesStore } from './categories'

export const useInspectionStore = defineStore('inspection', () => {
  // State
  const inspections = ref([])
  const currentEquipmentId = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Actions
  async function submitInspection(equipmentId, categoryId, formData, extraData = {}) {
    const authStore = useAuthStore()
    const categoriesStore = useCategoriesStore()
    isLoading.value = true
    error.value = null

    try {
      // 獲取該類別的欄位配置
      // 如果是區域設備(16)，可能需要用 extraData 中的 subCategory 來判斷，但目前欄位配置主要用於計算 status
      const category = categoriesStore.getCategoryById(categoryId)
      let fields = category?.form_config?.fields || []

      // 如果有傳入自定義 formConfig (區域設備流程)，優先使用
      if (extraData.formConfig) {
        fields = extraData.formConfig.fields || []
      }

      // 計算檢查狀態：只檢查布林類型的欄位（checkbox）
      // 數字、文字欄位僅作記錄，不影響 pass/fail 狀態
      const allChecksPassed = fields.every(field => {
        // 只檢查 checkbox 類型欄位
        if (field.type !== 'checkbox') return true

        // checkbox 必須明確選擇「正常」(true) 才算通過
        const value = formData[field.id]
        return value === true
      })

      const log = {
        id: Date.now().toString(),
        equipment_id: equipmentId,
        category_id: categoryId,
        sub_category: extraData.subCategory || null, // [NEW] 子類別 (設備類型)
        frequency: extraData.frequency || null,       // [NEW] 檢查頻率
        device_name: extraData.deviceName || null,    // [NEW] 設備名稱 (如 事務機1)
        inspector_id: authStore.user?.id,
        inspector_name: authStore.userName,
        inspector_email: authStore.userEmail,
        inspection_data: formData,
        notes: formData.notes || '',
        status: allChecksPassed ? 'pass' : 'fail',
        created_at: new Date().toISOString()
      }

      // TODO: 儲存到 Supabase
      inspections.value.unshift(log)

      // 暫時儲存到 localStorage
      const stored = JSON.parse(localStorage.getItem('inspection_logs') || '[]')
      stored.unshift(log)
      localStorage.setItem('inspection_logs', JSON.stringify(stored))

      return true
    } catch (err) {
      error.value = err.message
      console.error('Submit inspection error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loadInspections() {
    isLoading.value = true
    error.value = null

    try {
      // TODO: 從 Supabase 載入
      const stored = JSON.parse(localStorage.getItem('inspection_logs') || '[]')
      inspections.value = stored
      return stored
    } catch (err) {
      error.value = err.message
      console.error('Load inspection logs error:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  function setCurrentEquipment(equipmentId) {
    currentEquipmentId.value = equipmentId
  }

  function clearLogs() {
    inspections.value = []
    localStorage.removeItem('inspection_logs')
  }

  function exportToCSV(data = null, activeColumns = null) {
    const targetData = data || inspections.value
    if (targetData.length === 0) {
      throw new Error('沒有資料可以匯出')
    }

    const categoriesStore = useCategoriesStore()

    // 1. 收集標題 (如果有傳入 activeColumns 則直接使用)
    const dynamicHeaders = new Set()

    if (activeColumns && activeColumns.length > 0) {
      activeColumns.forEach(col => dynamicHeaders.add(col.label))
    } else {
      // 否則遍歷所有類別 (舊邏輯，作為備案)
      categoriesStore.categories.forEach(category => {
        const fields = category.form_config?.fields || []
        fields.forEach(field => {
          if (field.id !== 'notes') {
            dynamicHeaders.add(field.label)
          }
        })
      })
    }

    const dynamicHeaderArray = Array.from(dynamicHeaders)

    // CSV 標題列
    const headers = [
      '檢查時間',
      '設備編號',
      '類別',
      '檢查人員',
      '檢查人員Email',
      '狀態',
      ...dynamicHeaderArray, // 動態插入所有題目欄位
      '備註'
    ]

    // 建立 CSV 內容
    const rows = targetData.map(log => {
      // 取得該設備對應的類別設定
      const category = categoriesStore.getCategoryById(log.category_id)
      const fields = category?.form_config?.fields || []
      const data = log.inspection_data || {}

      // 建立動態欄位的值
      const dynamicValues = dynamicHeaderArray.map(headerLabel => {
        // 在此類別中尋找符合此 Label 的欄位 ID
        const field = fields.find(f => f.label === headerLabel)

        if (field) {
          // 如果此類別有這個欄位，取出值
          const value = data[field.id]

          if (value === undefined || value === null) return ''

          // 格式化數值
          if (typeof value === 'boolean') {
            return value ? '正常' : '異常'
          } else {
            return value
          }
        } else {
          // 此類別沒有這個欄位，留空
          return ''
        }
      })

      return [
        new Date(log.created_at).toLocaleString('zh-TW'),
        log.equipment_id,
        category?.name || log.category_id,
        log.inspector_name,
        log.inspector_email,
        log.status === 'pass' ? '合格' : '異常',
        ...dynamicValues, // 展開動態值
        log.notes || ''
      ]
    })

    // 組合 CSV 內容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // 處理 CSV 跳脫字元 (如果內容包含逗號或引號，需包裹引號並跳脫)
        const cellStr = String(cell || '')
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(','))
    ].join('\n')

    // 加入 BOM 以支援中文
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `檢查紀錄_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    inspections,
    currentEquipmentId,
    isLoading,
    error,
    submitInspection,
    loadInspections,
    setCurrentEquipment,
    clearLogs,
    exportToCSV
  }
})
