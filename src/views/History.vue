<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 safe-top">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">檢查紀錄</h1>
        </div>
        <p class="text-sm text-gray-600 mt-1">共 {{ inspections.length }} 筆紀錄</p>
      </div>

      <!-- Filters -->
      <div class="px-4 pb-4 flex gap-2 overflow-x-auto">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="filterCategory = category.id"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            filterCategory === category.id
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 active:bg-gray-200'
          ]"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
    </header>

    <!-- Search & Filter Controls -->
    <div class="px-4 pb-4 pt-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search Bar -->
        <div class="relative flex-1">
          <input
            v-model="searchEquipmentId"
            list="equipment-ids"
            type="text"
            placeholder="輸入或選擇設備編號..."
            class="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <datalist id="equipment-ids">
            <option v-for="eq in allEquipment" :key="eq.id" :value="eq.id">
              {{ eq.name }} - {{ eq.location }}
            </option>
          </datalist>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 shrink-0">
          <button
            @click="showColumnSelector = true"
            class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-all font-medium text-sm shadow-sm"
          >
            <span class="text-sm">⚙️</span>
            <span class="hidden sm:inline">自訂欄位 ({{ visibleColumnIds.length }})</span>
          </button>
          
          <button
            v-if="filteredInspections.length > 0"
            @click="handleExport"
            class="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 active:bg-green-200 transition-all font-medium text-sm shadow-sm"
            title="匯出當前列表 CSV"
          >
            <span class="text-lg">📊</span>
            <span class="hidden sm:inline">匯出 CSV</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <!-- Main Content: Table View -->
    <main class="flex-1 overflow-x-auto overflow-y-auto p-4 pb-24 bg-gray-50/50">
      <!-- Empty State -->
      <div v-if="filteredInspections.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100 mx-auto max-w-lg mt-10">
        <div class="text-6xl mb-4 opacity-80">📋</div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">暫無資料</h3>
        <p class="text-slate-500 mb-6">
          {{ filterCategory ? '此類別暫無檢查紀錄' : '尚無符合條件的檢查紀錄' }}
        </p>
      </div>

      <!-- Data Table -->
      <div v-else class="min-w-[1000px]"> <!-- Force horizontal scroll on mobile -->
        <table class="w-full bg-white shadow-sm rounded-xl overflow-hidden border-separate border-spacing-0 border border-slate-100">
          <thead class="bg-blue-50/50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap sticky left-0 bg-blue-50/95 backdrop-blur z-10">檢查時間</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap">設備編號</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap">設備類別</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap">檢查人員</th>
              <th class="px-6 py-4 text-left text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap">狀態</th>
              <!-- Dynamic Columns -->
              <th 
                v-for="colId in visibleColumnIds" 
                :key="colId"
                class="px-6 py-4 text-left text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap"
              >
                {{ availableColumns.find(c => c.id === colId)?.label || colId }}
              </th>
              <th class="px-6 py-4 text-center text-sm font-bold text-slate-600 border-b border-slate-100 whitespace-nowrap sticky right-0 bg-blue-50/95 backdrop-blur z-10">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr 
              v-for="inspection in filteredInspections" 
              :key="inspection.id"
              class="hover:bg-blue-50/30 transition-colors group"
            >
              <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap sticky left-0 bg-white group-hover:bg-blue-50/30 transition-colors z-10 border-r border-transparent group-hover:border-blue-100">
                {{ formatDate(inspection.created_at) }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">
                {{ inspection.equipment_id }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                {{ getCategoryName(inspection.category_id) }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                {{ inspection.inspector_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1',
                    inspection.status === 'pass'
                      ? 'bg-green-100/50 text-green-700'
                      : 'bg-red-100/50 text-red-700'
                  ]"
                >
                  {{ inspection.status === 'pass' ? '合格' : '不合格' }}
                </span>
              </td>
              
              <!-- Dynamic Values -->
              <td 
                v-for="colId in visibleColumnIds" 
                :key="colId"
                class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap"
              >
                <span :class="{'text-red-500 font-medium': getInspectionValue(inspection, colId) === '異常'}">
                  {{ getInspectionValue(inspection, colId) }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-white group-hover:bg-blue-50/30 transition-colors z-10 border-l border-transparent group-hover:border-blue-100">
                <button 
                  @click="handleInspectionClick(inspection)"
                  class="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  title="查看詳情"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNav />

    <!-- Detail Modal -->
    <InspectionDetailModal
      :is-open="showModal"
      :inspection="selectedInspection"
      @close="showModal = false"
    />
    
    <!-- Column Selector Modal -->
    <ColumnSelector
      :is-open="showColumnSelector"
      :columns="columnState"
      @close="showColumnSelector = false"
      @toggle="handleColumnToggle"
      @reset="handleColumnReset"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCategoriesStore } from '../stores/categories'
import { useInspectionStore } from '../stores/inspection'
import { useEquipmentStore } from '../stores/equipment'
import BottomNav from '../components/BottomNav.vue'
import InspectionDetailModal from '../components/InspectionDetailModal.vue'
import ColumnSelector from '../components/ColumnSelector.vue'

const categoriesStore = useCategoriesStore()
const inspectionStore = useInspectionStore()
const equipmentStore = useEquipmentStore()

const filterCategory = ref(null)
const searchEquipmentId = ref('')
const showModal = ref(false)
const showColumnSelector = ref(false)
const selectedInspection = ref({})
const visibleColumnIds = ref([]) // IDs of currently visible dynamic columns
const isInitialized = ref(false)

const categories = computed(() => categoriesStore.categories)
const allEquipment = computed(() => equipmentStore.equipmentList)
const inspections = computed(() => inspectionStore.inspections)

// Compute all available dynamic columns based on categories
const availableColumns = computed(() => {
  const cols = []
  // If a category is selected, only show columns for that category
  // If 'All' (null), show all possible columns
  const targetCategories = filterCategory.value 
    ? categoriesStore.categories.filter(c => c.id === filterCategory.value)
    : categoriesStore.categories

  targetCategories.forEach(cat => {
    const fields = cat.form_config?.fields || []
    fields.forEach(field => {
      if (field.id !== 'notes' && !cols.find(c => c.id === field.id)) {
        cols.push({ id: field.id, label: field.label })
      }
    })
  })
  return cols
})

// Initialize visible columns (default to first 4 or all if less)
const columnState = computed(() => {
  return availableColumns.value.map(col => ({
    ...col,
    visible: visibleColumnIds.value.includes(col.id)
  }))
})

// Initialize default columns once loaded
import { watch } from 'vue'
watch(availableColumns, (newCols) => {
  if (!isInitialized.value && newCols.length > 0) {
    visibleColumnIds.value = newCols.slice(0, 4).map(c => c.id)
    isInitialized.value = true
  }
}, { immediate: true })

function handleColumnToggle(id) {
  const index = visibleColumnIds.value.indexOf(id)
  if (index === -1) {
    visibleColumnIds.value.push(id)
  } else {
    visibleColumnIds.value.splice(index, 1)
  }
}

function handleColumnReset() {
  visibleColumnIds.value = availableColumns.value.slice(0, 4).map(c => c.id)
}

function getInspectionValue(inspection, fieldId) {
  const val = inspection.inspection_data?.[fieldId]
  if (val === undefined || val === null) return '-'
  if (typeof val === 'boolean') return val ? '正常' : '異常'
  return val
}

const filteredInspections = computed(() => {
  let result = inspectionStore.inspections

  // 1. Filter by Category Tab
  if (filterCategory.value) {
    result = result.filter(i => i.category_id === filterCategory.value)
  }

  // 2. Filter by Search ID
  if (searchEquipmentId.value) {
    const query = searchEquipmentId.value.toLowerCase()
    result = result.filter(i => i.equipment_id.toLowerCase().includes(query))
  }

  return result
})

onMounted(async () => {
  await inspectionStore.loadInspections()
  
  // Default to first category if none selected
  if (!filterCategory.value && categories.value.length > 0) {
    filterCategory.value = categories.value[0].id
  }
})

function getCategoryIcon(categoryId) {
  const category = categoriesStore.getCategoryById(categoryId)
  return category?.icon || '📋'
}

function getCategoryName(categoryId) {
  const category = categoriesStore.getCategoryById(categoryId)
  return category?.name || '未知類別'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} 分鐘前`
  } else if (diffHours < 24) {
    return `${diffHours} 小時前`
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function handleInspectionClick(inspection) {
  selectedInspection.value = inspection
  showModal.value = true
}

function handleExport() {
  try {
    // Pass both data AND the current context's available columns to ensure clean export
    inspectionStore.exportToCSV(filteredInspections.value, availableColumns.value)
  } catch (error) {
    alert(error.message)
  }
}

</script>
