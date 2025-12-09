<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm"
      @click="$emit('close')"
    ></div>

    <!-- Modal Panel -->
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div 
        class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full max-w-sm"
      >
        <!-- Header -->
        <div 
          class="px-4 py-5 sm:px-6 border-b border-gray-100 flex justify-between items-center"
          :class="headerBgClass"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ categoryIcon }}</span>
            <div>
              <h3 class="text-lg font-bold text-gray-900 leading-6">
                {{ categoryName }}
              </h3>
              <p class="text-xs opacity-75 mt-0.5 font-medium">
                {{ inspection.equipment_id }}
              </p>
            </div>
          </div>
          <button 
            @click="$emit('close')"
            class="rounded-full p-2 hover:bg-black/5 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="max-h-[70vh] overflow-y-auto">
          <!-- Meta Info -->
          <div class="px-6 py-4 bg-gray-50 grid grid-cols-2 gap-4 text-sm border-b border-gray-100">
            <div>
              <p class="text-gray-500 text-xs mb-1">檢查人員</p>
              <p class="font-medium text-gray-900">{{ inspection.inspector_name }}</p>
            </div>
            <div>
              <p class="text-gray-500 text-xs mb-1">檢查時間</p>
              <p class="font-medium text-gray-900">{{ formattedTime }}</p>
            </div>
            <div>
              <p class="text-gray-500 text-xs mb-1">狀態</p>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]"
              >
                {{ isPass ? '合格' : '異常' }}
              </span>
            </div>
          </div>

          <!-- Inspection Items -->
          <div class="px-6 py-4 space-y-4">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider">
              檢點項目
            </h4>
            
            <div v-if="inspectionDetails.length > 0" class="space-y-3">
              <div 
                v-for="item in inspectionDetails" 
                :key="item.id"
                class="flex items-start justify-between gap-4 p-3 rounded-lg"
                :class="item.isPass ? 'bg-white' : 'bg-red-50'"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900 mb-1">
                    {{ item.label }}
                  </p>
                  <p v-if="!item.isPass" class="text-xs text-red-600 font-medium">
                    需要注意
                  </p>
                </div>
                <div class="shrink-0">
                  <span v-if="item.isBoolean">
                     <span v-if="item.value" class="text-green-600 flex items-center gap-1 text-sm font-bold">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                       </svg>
                       正常
                     </span>
                     <span v-else class="text-red-600 flex items-center gap-1 text-sm font-bold">
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                       </svg>
                       異常
                     </span>
                  </span>
                  <span v-else class="text-sm text-gray-700 font-medium">
                    {{ item.value }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-4 text-gray-500 text-sm">
              無詳細檢查項目資料
            </div>

            <!-- Notes -->
            <div v-if="inspection.notes" class="mt-6 pt-4 border-t border-gray-100">
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                備註
              </h4>
              <div class="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm leading-relaxed">
                {{ inspection.notes }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            @click="$emit('close')"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCategoriesStore } from '../stores/categories'

const props = defineProps({
  isOpen: Boolean,
  inspection: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

const categoriesStore = useCategoriesStore()

// Helpers
const category = computed(() => {
  if (!props.inspection) return null
  return categoriesStore.getCategoryById(props.inspection.category_id)
})

const categoryName = computed(() => category.value?.name || '未知設備')
const categoryIcon = computed(() => category.value?.icon || '📋')
const isPass = computed(() => props.inspection?.status === 'pass')

const headerBgClass = computed(() => {
  return isPass.value ? 'bg-green-50' : 'bg-red-50'
})

const formattedTime = computed(() => {
  if (!props.inspection?.created_at) return ''
  return new Date(props.inspection.created_at).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const inspectionDetails = computed(() => {
  if (!props.inspection || !category.value) return []

  const config = category.value.form_config?.fields || []
  const data = props.inspection.inspection_data || {}

  return config
    .filter(field => field.id !== 'notes') // Notes handled separately
    .map(field => {
      const val = data[field.id]
      // Determine if it's a pass/fail boolean type check
      const isBoolean = field.type === 'checkbox'
      
      return {
        id: field.id,
        label: field.label,
        value: val,
        isBoolean: isBoolean,
        // For checkboxes, true means pass. 
        // For radios, we might need specific logic, but usually non-empty is done.
        // Let's assume 'true' is good for checkbox.
        isPass: isBoolean ? val === true : true
      }
    })
})
</script>
