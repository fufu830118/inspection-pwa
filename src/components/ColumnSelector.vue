<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚙️</span>
          <h3 class="font-bold text-gray-800">自訂顯示欄位</h3>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-6 max-h-[60vh] overflow-y-auto">
        <div class="space-y-3">
          <label 
            v-for="col in columns" 
            :key="col.id" 
            class="flex items-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50/50 hover:border-blue-100 cursor-pointer transition-all group"
            :class="{ 'bg-blue-50 border-blue-200': col.visible }"
          >
            <div class="relative flex items-center">
              <input 
                type="checkbox" 
                :checked="col.visible"
                @change="toggleColumn(col.id)"
                class="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition-all"
              />
            </div>
            <span class="ml-3 font-medium text-gray-700 group-hover:text-gray-900">{{ col.label }}</span>
          </label>
        </div>
      </div>
      
      <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
        <button 
          @click="$emit('reset')"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-lg transition-colors text-sm font-medium"
        >
          重置預設
        </button>
        <button 
          @click="$emit('close')"
          class="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:transform active:scale-95 transition-all shadow-lg shadow-slate-200 font-medium"
        >
          完成
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  columns: {
    type: Array, // Array of { id, label, visible }
    required: true
  }
})

const emit = defineEmits(['close', 'toggle', 'reset'])

function toggleColumn(id) {
  emit('toggle', id)
}
</script>
