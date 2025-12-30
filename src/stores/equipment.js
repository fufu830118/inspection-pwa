import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useInspectionStore } from './inspection'
import { loadAllEquipment } from '../utils/csvLoader'
import { useCategoriesStore } from './categories'

export const useEquipmentStore = defineStore('equipment', () => {
  // State - 設備清單 (從 CSV 動態載入)
  const equipmentList = ref([])

  const isLoading = ref(false)

  // Helper functions for frequency-based tracking
  /**
   * 獲取指定頻率的檢查期間
   * @param {string} frequency - 頻率類型: '每週', '每月', '每季'
   * @returns {Object} { start: Date, end: Date }
   */
  function getInspectionPeriod(frequency) {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    if (frequency === '每週') {
      // 本週一到今天
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day // 週日算上週
      start.setDate(now.getDate() + diff)
      start.setHours(0, 0, 0, 0)
    } else if (frequency === '每季') {
      // 本季第一天到今天
      const month = now.getMonth()
      const quarterStartMonth = Math.floor(month / 3) * 3
      start.setMonth(quarterStartMonth, 1)
      start.setHours(0, 0, 0, 0)
    } else {
      // 預設每月：本月第一天到今天
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
    }

    return { start, end: now }
  }

  // Getters
  // 根據類別ID獲取該類別的所有設備
  const getEquipmentByCategory = computed(() => {
    return (categoryId) => {
      return equipmentList.value.filter(eq => eq.categoryId === categoryId)
    }
  })

  // 獲取每個類別的檢查進度
  const getCategoryProgress = computed(() => {
    return (categoryId) => {
      const inspectionStore = useInspectionStore()
      const categoriesStore = useCategoriesStore()
      const equipment = equipmentList.value.filter(eq => eq.categoryId === categoryId)
      const total = equipment.length

      if (total === 0) return { checked: 0, total: 0, percentage: 0 }

      // 獲取該類別的檢查頻率
      const category = categoriesStore.categories.find(cat => cat.id === categoryId)
      const frequency = category?.frequency || '每月'

      // 根據頻率獲取檢查期間
      const { start, end } = getInspectionPeriod(frequency)

      const checkedEquipment = equipment.filter(eq => {
        // 檢查該設備在本期間是否有檢查記錄
        return inspectionStore.inspections.some(log => {
          const logDate = new Date(log.created_at)
          return log.equipment_id === eq.id &&
            logDate >= start &&
            logDate <= end
        })
      })

      const checked = checkedEquipment.length
      const percentage = Math.round((checked / total) * 100)

      return { checked, total, percentage, frequency }
    }
  })

  // 獲取本期間未檢查的設備列表
  const getUncheckedEquipment = computed(() => {
    return (categoryId) => {
      const inspectionStore = useInspectionStore()
      const categoriesStore = useCategoriesStore()
      const equipment = equipmentList.value.filter(eq => eq.categoryId === categoryId)

      // 獲取該類別的檢查頻率
      const category = categoriesStore.categories.find(cat => cat.id === categoryId)
      const frequency = category?.frequency || '每月'

      // 根據頻率獲取檢查期間
      const { start, end } = getInspectionPeriod(frequency)

      return equipment.filter(eq => {
        // 檢查該設備在本期間是否沒有檢查記錄
        return !inspectionStore.inspections.some(log => {
          const logDate = new Date(log.created_at)
          return log.equipment_id === eq.id &&
            logDate >= start &&
            logDate <= end
        })
      })
    }
  })

  // Actions
  function getEquipmentById(equipmentId) {
    return equipmentList.value.find(eq => eq.id === equipmentId)
  }

  // 根據 QR Code (亂碼) 查找設備
  function getEquipmentByQRCode(qrCode) {
    return equipmentList.value.find(eq => eq.qrCode === qrCode)
  }

  async function loadEquipment() {
    isLoading.value = true
    try {
      // 從 CSV 載入所有設備清單
      const allEquipment = await loadAllEquipment()

      // 取得 categories store 以對應 categoryId
      const categoriesStore = useCategoriesStore()

      // 為每個設備加上 categoryId
      equipmentList.value = allEquipment.map(eq => {
        const category = categoriesStore.categories.find(cat => cat.name === eq.categoryName)
        return {
          ...eq,
          categoryId: category?.id || '0'
        }
      })

      return equipmentList.value
    } catch (error) {
      console.error('Failed to load equipment from CSV:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    equipmentList,
    isLoading,
    getEquipmentByCategory,
    getCategoryProgress,
    getUncheckedEquipment,
    getEquipmentById,
    getEquipmentByQRCode,
    loadEquipment
  }
})
