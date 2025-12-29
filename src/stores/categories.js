import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadAllCategories } from '../utils/csvLoader'

export const useCategoriesStore = defineStore('categories', () => {
  // State - 從 CSV 動態載入，預設為空陣列
  const categories = ref([])

  const isLoading = ref(false)
  const error = ref(null)

  // Actions
  function getCategoryByPrefix(prefix) {
    return categories.value.find(cat => cat.id_prefix === prefix)
  }

  function getCategoryById(id) {
    return categories.value.find(cat => cat.id === id)
  }

  async function loadCategories() {
    // 從 CSV 檔案載入類別資料
    isLoading.value = true
    try {
      const loadedCategories = await loadAllCategories()
      categories.value = loadedCategories
      return categories.value
    } catch (err) {
      error.value = err.message
      console.error('Failed to load categories from CSV:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function findCategoryByEquipmentId(equipmentId) {
    // 從設備編號中提取前綴 (例如: "FIRE-001" -> "FIRE")
    const prefix = equipmentId.split('-')[0].toUpperCase()
    return categories.value.find(cat => cat.id_prefix === prefix)
  }

  return {
    categories,
    isLoading,
    error,
    getCategoryByPrefix,
    getCategoryById,
    loadCategories,
    findCategoryByEquipmentId
  }
})
