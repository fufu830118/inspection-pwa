<template>
  <div class="h-full flex flex-col bg-black">
    <!-- Header -->
    <header class="bg-gray-900 text-white safe-top z-10">
      <div class="px-4 py-4">
        <h1 class="text-xl font-bold">掃描 QR Code</h1>
        <p class="text-sm text-gray-300 mt-1">請對準設備上的 QR Code</p>
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

      <!-- Manual Input Option -->
      <button
        v-if="!error && isScanning"
        @click="showManualInput = true"
        class="absolute bottom-4 bg-white text-gray-900 px-6 py-2 rounded-full shadow-lg text-sm font-medium"
      >
        手動輸入設備編號
      </button>
    </div>

    <!-- Manual Input Modal -->
    <div
      v-if="showManualInput"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-20"
      @click.self="showManualInput = false"
    >
      <div class="bg-white rounded-xl p-6 max-w-sm w-full">
        <h2 class="text-xl font-bold mb-4">手動輸入設備編號</h2>
        <input
          v-model="manualInput"
          type="text"
          placeholder="例如: FIRE-001"
          class="input-field mb-4"
          @keyup.enter="handleManualSubmit"
        >
        <div class="flex gap-3">
          <button
            @click="showManualInput = false"
            class="flex-1 btn btn-secondary"
          >
            取消
          </button>
          <button
            @click="handleManualSubmit"
            class="flex-1 btn btn-primary"
          >
            確定
          </button>
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

const showManualInput = ref(false)
const manualInput = ref('')

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

function processEquipmentId(equipmentId) {
  // 先從設備清單中查找設備
  const equipment = equipmentStore.getEquipmentById(equipmentId)

  if (equipment) {
    // 停止掃描
    stopScanning()

    // 從設備資訊取得 categoryId，導向檢查表單頁面
    router.push({
      name: 'inspection-form',
      params: {
        categoryId: equipment.categoryId,
        equipmentId: equipmentId
      }
    })
  } else {
    // 無法識別的設備編號
    alert(`找不到設備編號: ${equipmentId}\n\n請確認編號是否正確，或聯絡系統管理員。`)
  }
}

function retryScanning() {
  error.value = null
  initScanner()
}

function handleManualSubmit() {
  if (manualInput.value.trim()) {
    processEquipmentId(manualInput.value.trim())
    showManualInput.value = false
    manualInput.value = ''
  }
}
</script>
