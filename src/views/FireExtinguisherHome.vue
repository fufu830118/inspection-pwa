<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Top Section: Instructions -->
    <div class="bg-white p-4 shadow-sm z-10">
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
        <div class="flex items-start gap-3">
          <div class="text-2xl">ℹ️</div>
          <div>
            <h2 class="font-bold text-blue-900 text-sm mb-1">本系統僅支援 掃描滅火器 QR Code 進行檢點</h2>
            <p class="text-blue-700 text-xs">請至設備現場掃描 QR Code</p>
          </div>
        </div>
      </div>
      
      <button 
        @click="goToManualInput"
        class="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium active:bg-gray-200 flex items-center justify-center gap-2"
      >
        <span>⌨️</span>
        <span>手動輸入設備編號</span>
      </button>
    </div>

    <!-- Middle Section: QR Code Scanner -->
    <div class="relative bg-black shrink-0" style="height: 300px;">
      <div id="qr-reader" class="w-full h-full object-cover"></div>
      
      <!-- Scanner Overlay/Status -->
      <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
        <div class="text-white text-center p-4">
          <p class="mb-2">⚠️ {{ error }}</p>
          <button @click="retryScanning" class="px-4 py-2 bg-white text-black rounded-full text-sm">
            重試
          </button>
        </div>
      </div>
      
      <div v-if="!error && isScanning" class="absolute bottom-4 left-0 right-0 text-center">
        <span class="inline-block px-3 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
          掃描中...
        </span>
      </div>
    </div>

    <!-- Bottom Section: Read-only List -->
    <div class="flex-1 flex flex-col min-h-0 bg-gray-50">
      <div class="px-4 py-2 bg-gray-100 border-b border-gray-200">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
          未檢點項目清單 (僅供參考)
        </h3>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- Empty State -->
        <div v-if="uncheckedEquipment.length === 0" class="text-center py-8">
          <div class="text-4xl mb-2">✅</div>
          <p class="text-gray-500 text-sm">本月已完成所有檢點</p>
        </div>

        <!-- List Items -->
        <div
          v-for="equipment in uncheckedEquipment"
          :key="equipment.id"
          class="bg-white rounded-lg p-3 shadow-sm border border-gray-100 opacity-75"
        >
          <div class="flex items-center gap-3">
            <!-- Status Icon (Static) -->
            <div class="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
              <span class="text-yellow-600 text-lg">⚠️</span>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-900 text-sm">{{ equipment.id }}</span>
                <span class="text-xs text-gray-400">未檢點</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="bg-gray-100 px-2 py-0.5 rounded">
                  {{ equipment.location }}
                </span>
                <span>
                  上次：{{ getLastInspectionDate(equipment.id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center py-4 text-xs text-gray-400">
          請至現場掃描 QR Code 進行檢點
        </div>
      </div>
    </div>
    
    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '../stores/equipment'
import { useInspectionStore } from '../stores/inspection'
import { useQRScanner } from '../composables/useQRScanner'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const equipmentStore = useEquipmentStore()
const inspectionStore = useInspectionStore()
const { isScanning, error, startScanning, stopScanning } = useQRScanner()

// Fire Extinguisher Category ID is '1'
const CATEGORY_ID = '1'

function goToManualInput() {
  router.push({ name: 'manual-input' })
}

// Computed
const uncheckedEquipment = computed(() => {
  return equipmentStore.getUncheckedEquipment(CATEGORY_ID)
})

// Methods
function getLastInspectionDate(equipmentId) {
  // Find the latest inspection log for this equipment
  // Note: This is a simple lookup. In a real app, might need to sort by date.
  // Assuming inspectionStore.inspections is ordered or we just find the last one.
  // For now, let's just say "N/A" if not found, or show the date if we can find one from previous months.
  // The current store structure might not easily give "last month's" inspection without filtering.
  // Let's just return a placeholder or try to find one.
  
  const logs = inspectionStore.inspections.filter(log => log.equipment_id === equipmentId)
  if (logs.length > 0) {
    // Sort by date desc
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const date = new Date(logs[0].created_at)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  }
  return '尚無紀錄'
}

// Scanner Logic
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
  // Ignore minor scanning errors, only show if persistent or critical
  // console.warn(err)
}

function retryScanning() {
  error.value = null
  initScanner()
}

function processEquipmentId(equipmentId) {
  const equipment = equipmentStore.getEquipmentById(equipmentId)

  if (equipment) {
    // Check if it matches our category (Fire Extinguisher)
    if (equipment.categoryId !== CATEGORY_ID) {
      alert('此設備不屬於滅火器類別！')
      return
    }

    stopScanning()
    router.push({
      name: 'inspection-form',
      params: {
        categoryId: equipment.categoryId,
        equipmentId: equipmentId
      }
    })
  } else {
    alert(`找不到設備編號: ${equipmentId}`)
  }
}

// Lifecycle
onMounted(async () => {
  await equipmentStore.loadEquipment()
  await inspectionStore.loadInspections()
  initScanner()
})

onBeforeUnmount(() => {
  stopScanning()
})
</script>

<style scoped>
/* Ensure scanner container has correct aspect ratio or size */
#qr-reader {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
