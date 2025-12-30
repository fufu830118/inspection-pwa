<template>
  <div class="h-full flex flex-col bg-black">
    <!-- Header -->
    <header class="bg-gray-900 text-white safe-top z-10">
      <div class="px-4 py-4">
        <div class="flex items-center gap-3">
          <button
            @click="$router.push('/')"
            class="p-2 -ml-2 text-white active:bg-gray-800 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div class="flex-1">
            <h1 class="text-xl font-bold">掃描 QR Code</h1>
            <p class="text-sm text-gray-300 mt-1">請對準設備上的 QR Code</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Scanner Container -->
    <div class="flex-1 flex flex-col items-center justify-center relative">
      <!-- QR Scanner -->
      <div id="qr-reader" class="w-full max-w-md"></div>

      <!-- Error Message -->
      <div v-if="error" class="absolute inset-0 flex items-center justify-center p-6">
        <div class="bg-red-500 text-white p-6 rounded-xl shadow-lg max-w-sm">
          <div class="text-4xl mb-3 text-center">⚠️</div>
          <p class="text-center font-medium mb-4">{{ error }}</p>
          <button
            @click="retryScanning"
            class="w-full btn bg-white text-red-600 active:bg-gray-100"
          >
            重試
          </button>
        </div>
      </div>

      <!-- Instructions -->
      <div v-if="!error && isScanning" class="absolute bottom-24 left-0 right-0 px-6">
        <div class="bg-white bg-opacity-90 p-4 rounded-xl shadow-lg">
          <p class="text-center text-gray-900 text-sm">
            請將 QR Code 對準掃描框內
          </p>
          <p class="text-center text-gray-600 text-xs mt-1">
            系統會自動識別設備類別
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriesStore } from '../stores/categories'
import { useEquipmentStore } from '../stores/equipment'
import { useQRScanner } from '../composables/useQRScanner'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const categoriesStore = useCategoriesStore()
const equipmentStore = useEquipmentStore()
const { isScanning, error, startScanning, stopScanning } = useQRScanner()

onMounted(() => {
  initScanner()
})

onBeforeUnmount(() => {
  stopScanning()
})

function initScanner() {
  startScanning(
    'qr-reader',
    handleScanSuccess,
    handleScanError
  )
}

function handleScanSuccess(decodedText) {
  processEquipmentId(decodedText)
}

function handleScanError(err) {
  console.error('掃描錯誤:', err)
}

function processEquipmentId(qrCodeOrId) {
  // 先嘗試用 QR Code (亂碼) 查找設備
  let equipment = equipmentStore.getEquipmentByQRCode(qrCodeOrId)

  // 如果找不到，再嘗試用設備編號查找
  if (!equipment) {
    equipment = equipmentStore.getEquipmentById(qrCodeOrId)
  }

  if (equipment) {
    // 停止掃描
    stopScanning()

    // 檢查是否為區域類別（ID為16）
    const category = categoriesStore.getCategoryById(equipment.categoryId)
    
    if (category && (category.name === '區域' || category.id === '16' || category.id === 16)) {
      // 區域類別：導向設備選擇頁面
      router.push({
        name: 'area-device-selector',
        params: {
          areaId: equipment.id
        }
      })
    } else {
      // 一般設備：導向檢查表單頁面
      router.push({
        name: 'inspection-form',
        params: {
          categoryId: equipment.categoryId,
          equipmentId: equipment.id
        }
      })
    }
  } else {
    // 無法識別的設備編號或 QR Code
    alert(`找不到設備: ${qrCodeOrId}\\n\\n請確認 QR Code 是否正確，或聯絡系統管理員。`)
  }
}

function retryScanning() {
  error.value = null
  initScanner()
}
</script>
