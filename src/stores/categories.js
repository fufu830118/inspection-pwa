import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = ref([
    {
      id: '1',
      name: '滅火器',
      id_prefix: 'FIRE',
      icon: '🧯',
      frequency: '每月',
      form_config: {
        fields: [
          {
            id: 'appearance',
            label: '瓶身外觀是否無鏽蝕狀況',
            type: 'checkbox',
            required: true
          },
          {
            id: 'pressure',
            label: '壓力指示值是否在有效範圍(綠色)內',
            type: 'checkbox',
            required: true
          },
          {
            id: 'parts',
            label: '插梢、壓把、皮管、噴嘴是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'expiry',
            label: '滅火器是否於有效日期內',
            type: 'checkbox',
            required: true
          },
          {
            id: 'label',
            label: '手持式滅火器是否有標示牌與專用放置盒',
            type: 'checkbox',
            required: true
          },
          {
            id: 'obstruction',
            label: '滅火器是否無雜物遮擋',
            type: 'checkbox',
            required: true
          },
          {
            id: 'notes',
            label: '其他與問題描述 (若無則空白)',
            type: 'textarea',
            required: false
          }
        ]
      }
    },
    {
      id: '2',
      name: '自動門',
      id_prefix: 'AUTO',
      icon: '🚪',
      frequency: '每半年',
      form_config: {
        fields: [
          {
            id: 'appearance',
            label: '外觀是否無破損',
            type: 'checkbox',
            required: true
          },
          {
            id: 'operation',
            label: '開關是否無異音及正常開關',
            type: 'checkbox',
            required: true
          },
          {
            id: 'access_control',
            label: '門禁測試是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'track',
            label: '上軌道是否清潔',
            type: 'checkbox',
            required: true
          },
          {
            id: 'safety',
            label: '防夾功能是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'power',
            label: '電源功能是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'notes',
            label: '其他與問題描述 (若無則空白)',
            type: 'textarea',
            required: false
          }
        ]
      }
    },
    {
      id: '3',
      name: '防火鐵捲門',
      id_prefix: 'DOOR',
      icon: '🔥',
      frequency: '每半年',
      form_config: {
        fields: [
          {
            id: 'control_btn',
            label: '內部控制按鈕是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'up_speed',
            label: '上升速度是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'down_speed',
            label: '下降速度是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'track',
            label: '軌道是否無偏移',
            type: 'checkbox',
            required: true
          },
          {
            id: 'ground',
            label: '地面環境是否無障礙物',
            type: 'checkbox',
            required: true
          },
          {
            id: 'power',
            label: '電源功能是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'notes',
            label: '其他與問題描述 (若無則空白)',
            type: 'textarea',
            required: false
          }
        ]
      }
    },
    {
      id: '4',
      name: '逃生門',
      id_prefix: 'EXIT',
      icon: '🚨',
      frequency: '每季',
      form_config: {
        fields: [
          {
            id: 'appearance',
            label: '外觀是否無破損',
            type: 'checkbox',
            required: true
          },
          {
            id: 'operation',
            label: '開關是否無異音及正常開關',
            type: 'checkbox',
            required: true
          },
          {
            id: 'handle',
            label: '門把是否無損壞',
            type: 'checkbox',
            required: true
          },
          {
            id: 'alarm',
            label: '警報是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'obstruction',
            label: '是否無障礙物阻擋',
            type: 'checkbox',
            required: true
          },
          {
            id: 'notes',
            label: '其他與問題描述 (若無則空白)',
            type: 'textarea',
            required: false
          }
        ]
      }
    },
    {
      id: '5',
      name: '會議室',
      id_prefix: 'ROOM',
      icon: '🏢',
      frequency: '每日',
      form_config: {
        fields: [
          {
            id: 'cleanliness',
            label: '會議室整潔度',
            type: 'radio',
            options: ['優良', '普通', '需改善'],
            required: true
          },
          {
            id: 'equipment',
            label: '設備功能正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'ac',
            label: '空調運作正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'notes',
            label: '備註',
            type: 'textarea',
            required: false
          }
        ]
      }
    },
    {
      id: '6',
      name: '沖眼器',
      id_prefix: 'EYE',
      icon: '👁️',
      frequency: '每月',
      form_config: {
        fields: [
          {
            id: 'water_flow',
            label: '水流是否正常',
            type: 'checkbox',
            required: true
          },
          {
            id: 'cleanliness',
            label: '外觀是否清潔',
            type: 'checkbox',
            required: true
          },
          {
            id: 'notes',
            label: '備註',
            type: 'textarea',
            required: false
          }
        ]
      }
    }
  ])

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
    // TODO: 從 Supabase 載入
    // 目前使用靜態資料
    isLoading.value = true
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      return categories.value
    } catch (err) {
      error.value = err.message
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
