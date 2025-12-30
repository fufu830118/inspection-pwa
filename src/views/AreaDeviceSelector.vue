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
            <h1 class="text-xl font-bold text-gray-900">📍 {{ areaName }}</h1>
            <p class="text-sm text-gray-600">請選擇要檢查的設備</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Device List -->
    <main class="flex-1 overflow-y-auto p-4">
      <div v-if="loading" class="text-center py-8 text-gray-500">
        載入中...
      </div>

      <div v-else-if="displayEquipmentList.length === 0" class="text-center py-8 text-gray-500">
        此區域沒有設備需要檢查
      </div>

      <div v-else class="space-y-3">
        <button
          v-for="item in displayEquipmentList"
          :key="item.key"
          @click="handleEquipmentClick(item)"
          class="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors text-left"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ item.icon }}</span>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900">{{ item.displayName }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{{ item.frequency }}</span>
                <span class="text-sm text-gray-500">{{ item.subtitle }}</span>
              </div>
            </div>
            <svg class="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Papa from 'papaparse'

const router = useRouter()
const route = useRoute()

const areaId = ref(route.params.areaId)
const deviceConfig = ref([])
const equipmentDetails = ref([])
const loading = ref(true)

// 設備圖示映射
const deviceIcons = {
  '事務機': '📠',
  '文具櫃': '📁',
  '植栽': '🌿',
  '環境清潔': '🧹',
  '冰箱': '🧊',
  '咖啡機': '☕'
}

function getDeviceIcon(deviceType) {
  return deviceIcons[deviceType] || '📦'
}

// 從區域設備詳細清單自動推斷區域名稱
const areaName = computed(() => {
  if (!equipmentDetails.value.length) return ''
  
  // 從詳細清單中找出該區域的任一筆記錄，取得區域ID作為名稱
  const firstEquipment = equipmentDetails.value.find(eq => eq['區域ID'] === areaId.value)
  return firstEquipment ? firstEquipment['區域ID'] : areaId.value
})

// 生成顯示用的設備列表（設備類型+頻率組合）
const displayEquipmentList = computed(() => {
  if (!deviceConfig.value.length || !equipmentDetails.value.length) return []
  
  const list = []
  
  // 按設備類型分組
  const deviceTypes = ['事務機', '文具櫃', '植栽', '環境清潔', '冰箱', '咖啡機']
  
  deviceTypes.forEach(deviceType => {
    // 從詳細清單中獲取該設備類型在此區域的所有實際設備
    const equipments = equipmentDetails.value.filter(eq => 
      eq['區域ID'] === areaId.value && eq['設備類型'] === deviceType
    )
    
    // 如果該區域沒有這種設備，跳過
    if (equipments.length === 0) return
    
    // 獲取該設備類型的所有頻率選項
    const frequencies = deviceConfig.value.filter(item => item['設備類型'] === deviceType)
    
    // 為每個頻率生成條目
    frequencies.forEach(freq => {
      // 如果該設備類型在此區域有多台設備，按編號分別顯示
      if (equipments.length > 1) {
        equipments.forEach((eq, index) => {
          list.push({
            key: `${deviceType}-${freq['頻率']}-${index}`,
            deviceType: deviceType,
            frequency: freq['頻率'],
            csvFile: freq['CSV檔案'],
            displayNameTemplate: freq['顯示名稱'],
            icon: getDeviceIcon(deviceType),
            displayName: `${deviceType}${index + 1} ${freq['頻率']}`,
            subtitle: eq['設備名稱'] || eq['型號'] || '',
            equipmentId: eq['設備編號'],
            equipmentData: eq
          })
        })
      } else if (equipments.length === 1) {
        // 只有一台設備，不需要編號
        const eq = equipments[0]
        list.push({
          key: `${deviceType}-${freq['頻率']}`,
          deviceType: deviceType,
          frequency: freq['頻率'],
          csvFile: freq['CSV檔案'],
          displayNameTemplate: freq['顯示名稱'],
          icon: getDeviceIcon(deviceType),
          displayName: `${deviceType} ${freq['頻率']}`,
          subtitle: eq['設備名稱'] || eq['型號'] || '',
          equipmentId: eq['設備編號'],
          equipmentData: eq
        })
      }
    })
  })
  
  return list
})

// 載入設備配置
async function loadDeviceConfig() {
  try {
    const response = await fetch('/檢點表/區域/設備配置.csv')
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('載入設備配置失敗:', error)
    return []
  }
}

// 載入區域設備詳細清單
async function loadEquipmentDetails() {
  try {
    const response = await fetch('/檢點表/區域/區域設備詳細清單.csv')
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      })
    })
  } catch (error) {
    console.error('載入設備詳細清單失敗:', error)
    return []
  }
}

// 處理設備點擊
function handleEquipmentClick(item) {
  router.push({
    name: 'area-inspection-form',
    params: {
      areaId: areaId.value,
      deviceType: item.deviceType,
      frequency: item.frequency,
      equipmentId: item.equipmentId
    },
    query: {
      csvFile: item.csvFile,
      displayName: item.displayNameTemplate
    }
  })
}

function handleBack() {
  router.push('/')
}

onMounted(async () => {
  loading.value = true
  
  // 並行載入資料
  const [config, details] = await Promise.all([
    loadDeviceConfig(),
    loadEquipmentDetails()
  ])
  
  deviceConfig.value = config
  equipmentDetails.value = details
  loading.value = false
  
  // 檢查是否有該區域的設備
  const hasEquipment = details.some(eq => eq['區域ID'] === areaId.value)
  if (!hasEquipment) {
    alert('找不到區域設備資訊')
    router.push('/')
  }
})
</script>
