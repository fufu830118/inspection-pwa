<template>
  <div
    class="card flex items-center gap-4 active:scale-95 transition-transform cursor-pointer"
    @click="$emit('click')"
  >
    <div class="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-primary-50 rounded-xl text-3xl">
      {{ category.icon }}
    </div>
    <div class="flex-1">
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-lg font-semibold text-gray-900">{{ category.name }}</h3>
        <span
          v-if="progress"
          class="text-sm font-medium"
          :class="progress.percentage === 100 ? 'text-green-600' : 'text-primary-600'"
        >
          {{ progress.checked }}/{{ progress.total }}
        </span>
      </div>
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-500">檢查頻率：{{ category.frequency }}</p>
        <div v-if="progress && progress.total > 0" class="flex items-center gap-2">
          <div class="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-300"
              :class="progress.percentage === 100 ? 'bg-green-500' : 'bg-primary-500'"
              :style="{ width: progress.percentage + '%' }"
            ></div>
          </div>
          <span class="text-xs text-gray-500">{{ progress.percentage }}%</span>
        </div>
      </div>
    </div>
    <div class="text-gray-400">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEquipmentStore } from '../stores/equipment'

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const equipmentStore = useEquipmentStore()

// 獲取該類別的檢查進度
const progress = computed(() => {
  return equipmentStore.getCategoryProgress(props.category.id)
})
</script>
