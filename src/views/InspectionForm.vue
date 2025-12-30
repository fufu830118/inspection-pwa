<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 safe-top">
      <div class="px-4 py-4">
        <div class="flex items-center gap-3 mb-2">
          <button
            @click="handleBack"
            class="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl font-bold text-gray-900">{{ category?.name }} 檢查</h1>
            <p class="text-sm text-gray-600">設備編號: {{ equipmentId }}</p>
          </div>
          <!-- Click Icon to Quick Check All -->
          <button 
            @click="handleCheckAll"
            class="text-4xl active:scale-90 transition-transform cursor-pointer hover:opacity-80 p-1 rounded-full"
            title="點擊此處將所有項目設為「正常」"
          >
            {{ category?.icon }}
          </button>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>檢查頻率: {{ category?.frequency }}</span>
        </div>
      </div>
    </header>

    <!-- Equipment Details Card -->
    <div v-if="equipment" class="mx-4 mt-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2">
        <h2 class="text-white font-bold text-sm">設備資訊</h2>
      </div>
      <div class="p-4 space-y-3">
        <!-- 固定显示：设备编号 -->
        <div>
          <p class="text-xs text-gray-500 mb-1">設備編號</p>
          <p class="text-sm font-bold text-gray-900">{{ equipment.id }}</p>
        </div>
        
        <!-- 动态显示：其他所有字段 -->
        <div class="grid grid-cols-2 gap-3">
          <div v-for="field in dynamicFields" :key="field.key">
            <p class="text-xs text-gray-500 mb-1">{{ field.label }}</p>
            <p 
              class="text-sm font-medium"
              :class="getFieldClass(field.key, field.value)"
            >
              {{ field.value || '-' }}
              <span v-if="field.key === 'expiryDate' && isExpiringSoon(field.value)" class="ml-1 text-xs">⚠️ 即將到期</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form -->
    <main class="flex-1 overflow-y-auto p-4">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Dynamic Form Fields -->
        <div
          v-for="field in category?.form_config?.fields"
          :key="field.id"
          class="card hover:border-gray-300 transition-colors"
        >
          <!-- Toggle Buttons (Formerly Checkbox) -->
          <div v-if="field.type === 'checkbox'" class="space-y-3">
             <div class="flex justify-between items-start">
              <label class="text-base font-medium text-gray-900 block">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500 ml-1">*</span>
              </label>
             </div>
            
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="formData[field.id] = true"
                class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all font-bold text-lg"
                :class="formData[field.id] === true 
                  ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200 scale-[1.02]' 
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'"
              >
                <span v-if="formData[field.id] === true">✓</span>
                正常
              </button>
              
              <button
                type="button"
                @click="formData[field.id] = false"
                class="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all font-bold text-lg"
                :class="formData[field.id] === false 
                  ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200 scale-[1.02]' 
                  : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'"
              >
                <span v-if="formData[field.id] === false">✕</span>
                異常
              </button>
            </div>
            
            <!-- Helper text for required fields -->
            <p v-if="field.required && formData[field.id] === null" class="text-xs text-orange-500 mt-1">
              * 請選擇檢查結果
            </p>
          </div>

          <!-- Radio Field -->
          <div v-else-if="field.type === 'radio'">
            <label class="block text-gray-900 mb-3 font-medium">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </label>
            <div class="space-y-2">
              <label
                v-for="option in field.options"
                :key="option"
                class="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                :class="{'bg-blue-50 border-blue-200': formData[field.id] === option}"
              >
                <input
                  v-model="formData[field.id]"
                  type="radio"
                  :value="option"
                  class="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                  :required="field.required"
                >
                <span class="text-gray-700 font-medium">{{ option }}</span>
              </label>
            </div>
          </div>

          <!-- Textarea Field -->
          <div v-else-if="field.type === 'textarea'">
            <label class="block text-gray-900 mb-2 font-medium">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </label>
            <textarea
              v-model="formData[field.id]"
              rows="3"
              class="input-field resize-none text-base"
              :required="field.required"
              :placeholder="field.required ? '請輸入內容' : '若有異常請在此說明...'"
            ></textarea>
          </div>

          <!-- Number Field -->
          <div v-else-if="field.type === 'number'">
            <label class="block text-gray-900 mb-2 font-medium">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </label>
            <div class="relative">
              <input
                v-model.number="formData[field.id]"
                type="number"
                step="0.01"
                class="input-field text-base pr-12"
                :required="field.required"
                :placeholder="field.required ? '請輸入數值' : '選填'"
              >
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {{ getUnit(field.label) }}
              </span>
            </div>
          </div>

          <!-- Text Field -->
          <div v-else-if="field.type === 'text'">
            <label class="block text-gray-900 mb-2 font-medium">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </label>
            <input
              v-model="formData[field.id]"
              type="text"
              class="input-field text-base"
              :required="field.required"
              :placeholder="field.required ? '請輸入內容' : '選填'"
            >
          </div>
        </div>

        <!-- Service Master Link -->
        <div class="mt-6 mb-4 text-center">
          <a
            href="https://forms.office.com/Pages/ResponsePage.aspx?id=KAZu2oP8r0yd0nMGHLqxZ75CpzJnvyNArXPTelSKMTdUNEdVUThIUkI2QzlEWkg1MTg5S0NWVEdLQi4u"
            target="_blank"
            class="inline-flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 rounded-full font-bold hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100"
          >
            <span>🚨</span>
            服務小當家異常通報
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <!-- Photo Upload (Optional future feature) -->


        <!-- Submit Button -->
        <div class="sticky bottom-0 left-0 right-0 p-4 bg-gray-50 -mx-4 -mb-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full btn btn-primary flex items-center justify-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }"
          >
            <svg v-if="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span v-if="isSubmitting">提交中...</span>
            <span v-else>完成檢查</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCategoriesStore } from '../stores/categories'
import { useInspectionStore } from '../stores/inspection'
import { useEquipmentStore } from '../stores/equipment'
import Papa from 'papaparse'
import { convertInspectionItemsToFormConfig } from '../utils/csvLoader'

const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()
const inspectionStore = useInspectionStore()
const equipmentStore = useEquipmentStore()

// 區域設備相關參數
const isAreaDevice = ref(route.params.isAreaDevice || false)
const areaId = ref(route.params.areaId)
const deviceType = ref(route.params.deviceType)
const frequency = ref(route.params.frequency)
const csvFile = ref(route.query.csvFile)
const displayName = ref(route.query.displayName)

const equipmentId = ref(route.params.equipmentId || route.params.areaId)
const categoryId = ref(route.params.categoryId)
const formData = ref({})
const isSubmitting = ref(false)
const areaFormConfig = ref(null)

const category = computed(() => {
  // 如果是區域設備，創建虛擬 category 物件
  if (isAreaDevice.value) {
    return {
      id: '16', // 區域類別ID
      name: deviceType.value,
      icon: getDeviceIcon(deviceType.value),
      frequency: frequency.value,
      form_config: areaFormConfig.value || { fields: [] }
    }
  }
  
  if (categoryId.value) {
    return categoriesStore.getCategoryById(categoryId.value)
  }
  // 如果沒有提供 categoryId，從設備編號推斷
  return categoriesStore.findCategoryByEquipmentId(equipmentId.value)
})

// 區域設備圖示映射
function getDeviceIcon(deviceName) {
  const icons = {
    '事務機': '📠',
    '文具櫃': '📁',
    '植栽': '🌿',
    '環境清潔': '🧹',
    '冰箱': '🧊',
    '咖啡機': '☕'
  }
  return icons[deviceName] || '📦'
}

// 获取设备详细资讯
const equipment = computed(() => {
  // 如果是區域設備，使用載入的區域設備詳細資料
  if (isAreaDevice.value && areaEquipmentData.value) {
    return {
      id: areaEquipmentData.value['設備編號'],
      categoryId: '16',
      categoryName: '區域',
      ...Object.fromEntries(
        Object.entries(areaEquipmentData.value).map(([key, value]) => {
          // 將中文欄位映射為英文屬性名
          const fieldMap = {
            '設備名稱': 'name',
            '廠牌': 'brand',
            '型號': 'model',
            '位置': 'location',
            '備註': 'note'
          }
          return [fieldMap[key] || key, value]
        })
      )
    }
  }
  
  // 一般設備
  return equipmentStore.getEquipmentById(equipmentId.value)
})

const areaEquipmentData = ref(null)

// 动态生成设备字段列表（排除固定字段）
const dynamicFields = computed(() => {
  if (!equipment.value) return []
  
  const excludeKeys = ['id', 'qrCode', 'categoryId', 'categoryName']
  const fieldLabelMap = {
    'location': '位置',
    'type': '類型',
    'size': '尺寸',
    'expiryDate': '有效日期',
    'spec': '規格',
    'brand': '廠牌',
    'model': '型號',
    'name': '名稱'
  }
  
  const fields = []
  Object.keys(equipment.value).forEach(key => {
    if (!excludeKeys.includes(key) && equipment.value[key]) {
      fields.push({
        key: key,
        label: fieldLabelMap[key] || key, // 如果有映射就用，否则用原始 key
        value: equipment.value[key]
      })
    }
  })
  
  return fields
})

// 根据字段类型返回样式类
function getFieldClass(fieldKey, fieldValue) {
  if (fieldKey === 'expiryDate' || fieldKey.includes('有效日期')) {
    return isExpiringSoon(fieldValue) ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
  }
  return 'text-gray-900'
}

// 載入區域設備檢點項目
async function loadAreaInspectionItems() {
  if (!csvFile.value) return null
  
  try {
    const response = await fetch(`/檢點表/區域/${csvFile.value}`)
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formConfig = convertInspectionItemsToFormConfig(results.data)
          resolve(formConfig)
        },
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('載入區域檢點項目失敗:', error)
    return null
  }
}

// 載入區域設備詳細資料
async function loadAreaEquipmentData() {
  if (!equipmentId.value) return null
  
  try {
    const response = await fetch('/檢點表/區域/區域設備詳細清單.csv')
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const equipmentData = results.data.find(row => row['設備編號'] === equipmentId.value)
          resolve(equipmentData)
        },
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('載入區域設備詳細資料失敗:', error)
    return null
  }
}

onMounted(async () => {
  // 如果是區域設備，先載入檢點項目和設備資料
  if (isAreaDevice.value) {
    const [formConfig, equipData] = await Promise.all([
      loadAreaInspectionItems(),
      loadAreaEquipmentData()
    ])
    
    areaFormConfig.value = formConfig
    areaEquipmentData.value = equipData
    
    if (!formConfig) {
      alert('無法載入檢點項目')
      router.push('/')
      return
    }
  }
  
  if (!category.value) {
    alert('無法識別設備類別')
    router.push('/')
    return
  }

  // 初始化表單資料
  category.value.form_config.fields.forEach(field => {
    if (field.type === 'checkbox') {
      // Initialize to null to force user selection (Normal vs Abnormal)
      formData.value[field.id] = null 
    } else if (field.type === 'radio') {
      formData.value[field.id] = ''
    } else {
      formData.value[field.id] = ''
    }
  })

  // 更新 categoryId (如果是從設備編號推斷的)
  if (!categoryId.value) {
    categoryId.value = category.value.id
  }
})

function handleBack() {
  if (confirm('確定要放棄這次檢查嗎？')) {
    // 如果是區域設備，返回設備選擇頁面
    if (isAreaDevice.value) {
      router.push({
        name: 'area-device-selector',
        params: { areaId: areaId.value || equipmentId.value }
      })
      return
    }

    // 一般設備：返回設備列表
    router.push({
      name: 'equipment-list',
      params: { categoryId: categoryId.value }
    })
  }
}

async function handleSubmit() {
  isSubmitting.value = true

  try {
    const success = await inspectionStore.submitInspection(
      equipmentId.value,
      categoryId.value,
      { ...formData.value }
    )

    if (success) {
      // 顯示成功訊息
      alert('✓ 檢查已完成！\n\n您可以在「紀錄」頁面查看所有檢查記錄。')

      // 導向掃描頁面 (連續檢查流程)
      router.push('/scan')
    } else {
      alert('提交失敗，請重試')
    }
  } catch (error) {
    alert('提交時發生錯誤: ' + error.message)
  } finally {
    isSubmitting.value = false
  }
}




function handleCheckAll() {
  // Confirm is optional, user wanted speed. Assuming implicit action or a light confirm.
  // User said "Click this button... toggle states should automatically switch", implying speed.
  // I will add a small confirmation to prevent accidents or just do it?
  // "一鍵切換...加速檢查" -> Let's keep it fast but safe.
  if (confirm('確定將所有項目設為「正常」？')) {
    category.value.form_config.fields.forEach(field => {
      if (field.type === 'checkbox') {
        formData.value[field.id] = true
      }
    })
  }
}


// 检查是否即将到期（6个月内）
function isExpiringSoon(expiryDateStr) {
  if (!expiryDateStr) return false

  const [year, month, day] = expiryDateStr.split('/').map(Number)
  const expiryDate = new Date(year, month - 1, day)
  const today = new Date()
  const sixMonthsLater = new Date()
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6)

  return expiryDate <= sixMonthsLater && expiryDate >= today
}

// 根据欄位名稱自動判斷單位
function getUnit(fieldLabel) {
  if (fieldLabel.includes('電壓')) {
    return 'V'
  } else if (fieldLabel.includes('電流')) {
    return 'A'
  }
  return ''
}

</script>
