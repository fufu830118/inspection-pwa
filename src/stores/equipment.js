import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useInspectionStore } from './inspection'
import { loadAllEquipment } from '../utils/csvLoader'
import { useCategoriesStore } from './categories'

export const useEquipmentStore = defineStore('equipment', () => {
  // State - 設備清單 (從 CSV 動態載入)
  const equipmentList = ref([])

  const isLoading = ref(false)

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
      const equipment = equipmentList.value.filter(eq => eq.categoryId === categoryId)
      const total = equipment.length

      if (total === 0) return { checked: 0, total: 0, percentage: 0 }

      // 獲取本月已檢查的設備
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const checkedEquipment = equipment.filter(eq => {
        // 檢查該設備本月是否有檢查記錄
        return inspectionStore.inspections.some(log => {
          const logDate = new Date(log.created_at)
          return log.equipment_id === eq.id &&
            logDate.getMonth() === currentMonth &&
            logDate.getFullYear() === currentYear
        })
      })

      const checked = checkedEquipment.length
      const percentage = Math.round((checked / total) * 100)

      return { checked, total, percentage }
    }
  })

  // 獲取本月未檢查的設備列表
  const getUncheckedEquipment = computed(() => {
    return (categoryId) => {
      const inspectionStore = useInspectionStore()
      const equipment = equipmentList.value.filter(eq => eq.categoryId === categoryId)

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      return equipment.filter(eq => {
        // 檢查該設備本月是否沒有檢查記錄
        return !inspectionStore.inspections.some(log => {
          const logDate = new Date(log.created_at)
          return log.equipment_id === eq.id &&
            logDate.getMonth() === currentMonth &&
            logDate.getFullYear() === currentYear
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
