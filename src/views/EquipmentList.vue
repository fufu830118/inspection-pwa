<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center gap-3">
        <button
          @click="$router.back()"
          class="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-gray-900">{{ category?.icon }} {{ category?.name }}</h1>
          <p class="text-sm text-gray-500">本月檢查進度：{{ progress.checked }}/{{ progress.total }}</p>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">完成度</span>
        <span class="text-sm font-medium" :class="progress.percentage === 100 ? 'text-green-600' : 'text-primary-600'">
          {{ progress.percentage }}%
        </span>
      </div>
      <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-500"
          :class="progress.percentage === 100 ? 'bg-green-500' : 'bg-primary-500'"
          :style="{ width: progress.percentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
      <div class="flex gap-2">
        <button
          @click="filterStatus = 'all'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 active:bg-gray-200'"
        >
          全部 ({{ allEquipment.length }})
        </button>
        <button
          @click="filterStatus = 'unchecked'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'unchecked' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 active:bg-gray-200'"
        >
          未檢查 ({{ uncheckedEquipment.length }})
        </button>
        <button
          @click="filterStatus = 'checked'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="filterStatus === 'checked' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 active:bg-gray-200'"
        >
          已檢查 ({{ checkedEquipment.length }})
        </button>
      </div>
    </div>

    <!-- Equipment List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-for="equipment in displayedEquipment"
        :key="equipment.id"
        class="card active:scale-95 transition-transform cursor-pointer"
        @click="handleEquipmentClick(equipment)"
      >
        <div class="flex items-start gap-3">
          <!-- Status Indicator -->
          <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg"
            :class="isEquipmentChecked(equipment.id) ? 'bg-green-50' : 'bg-yellow-50'"
          >
            <svg v-if="isEquipmentChecked(equipment.id)" class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
          </div>

          <!-- Equipment Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-1">
              <h3 class="font-semibold text-gray-900">{{ equipment.id }}</h3>
              <span
                class="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full"
                :class="isEquipmentChecked(equipment.id) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
              >
                {{ isEquipmentChecked(equipment.id) ? '已檢查' : '待檢查' }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mb-1">{{ equipment.name }}</p>
            <div class="flex flex-wrap gap-2 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ equipment.location }}
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                到期：{{ equipment.expiryDate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayedEquipment.length === 0" class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-500">沒有符合條件的設備</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoriesStore } from '../stores/categories'
import { useEquipmentStore } from '../stores/equipment'
import { useInspectionStore } from '../stores/inspection'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()
const equipmentStore = useEquipmentStore()
const inspectionStore = useInspectionStore()

const filterStatus = ref('all')

// 獲取類別資訊
const category = computed(() => {
  return categoriesStore.categories.find(cat => cat.id === route.params.categoryId)
})

// 獲取該類別的所有設備
const allEquipment = computed(() => {
  return equipmentStore.getEquipmentByCategory(route.params.categoryId)
})

// 獲取檢查進度
const progress = computed(() => {
  return equipmentStore.getCategoryProgress(route.params.categoryId)
})

// 獲取未檢查的設備
const uncheckedEquipment = computed(() => {
  return equipmentStore.getUncheckedEquipment(route.params.categoryId)
})

// 獲取已檢查的設備
const checkedEquipment = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return allEquipment.value.filter(eq => {
    return inspectionStore.inspections.some(log => {
      const logDate = new Date(log.created_at)
      return log.equipment_id === eq.id &&
             logDate.getMonth() === currentMonth &&
             logDate.getFullYear() === currentYear
    })
  })
})

// 根據過濾狀態顯示設備
const displayedEquipment = computed(() => {
  if (filterStatus.value === 'unchecked') {
    return uncheckedEquipment.value
  } else if (filterStatus.value === 'checked') {
    return checkedEquipment.value
  }
  return allEquipment.value
})

// 檢查設備是否已檢查
function isEquipmentChecked(equipmentId) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return inspectionStore.inspections.some(log => {
    const logDate = new Date(log.created_at)
    return log.equipment_id === equipmentId &&
           logDate.getMonth() === currentMonth &&
           logDate.getFullYear() === currentYear
  })
}

// 點擊設備開始檢查
function handleEquipmentClick(equipment) {
  router.push({
    name: 'inspection-form',
    params: {
      categoryId: category.value.id,
      equipmentId: equipment.id
    }
  })
}

onMounted(() => {
  // 載入設備列表
  equipmentStore.loadEquipment()
  // 載入檢查記錄
  inspectionStore.loadInspections()
})
</script>
