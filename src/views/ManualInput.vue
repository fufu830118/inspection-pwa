<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="flex-shrink-0 bg-white border-b border-gray-200 safe-top">
      <div class="px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900">手動輸入設備編號</h1>
        <p class="text-sm text-gray-600 mt-1">請輸入設備上的編號</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 pb-20">
      <div class="max-w-md mx-auto">
        <!-- Input Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            設備編號
          </label>
          <input
            v-model="equipmentId"
            type="text"
            placeholder="例如: A23A1-01-1"
            class="input-field text-lg"
            @keyup.enter="handleSubmit"
            autofocus
          >
          <p class="text-xs text-gray-500 mt-2">
            設備編號格式：區域-區-編號（如 A23A1-01-1）
          </p>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleSubmit"
          :disabled="!equipmentId.trim()"
          class="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          查詢設備
        </button>

        <!-- Recent Equipment (if any) -->
        <div v-if="recentEquipment.length > 0" class="mt-8">
          <h2 class="text-sm font-medium text-gray-700 mb-3">最近查詢</h2>
          <div class="space-y-2">
            <button
              v-for="eq in recentEquipment"
              :key="eq.id"
              @click="selectRecentEquipment(eq)"
              class="w-full text-left bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-lg p-4 transition-colors"
            >
              <div class="font-medium text-gray-900">{{ eq.id }}</div>
              <div class="text-sm text-gray-600 mt-1">{{ eq.name }} - {{ eq.location }}</div>
            </button>
          </div>
        </div>

        <!-- Help Section -->
        <div class="mt-8 bg-blue-50 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="text-2xl">💡</div>
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 mb-1">提示</h3>
              <p class="text-sm text-gray-600">
                設備編號通常標示在設備本體上，如果找不到編號，請聯絡管理人員。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEquipmentStore } from '../stores/equipment'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const equipmentStore = useEquipmentStore()

const equipmentId = ref('')
const recentEquipment = ref([])

onMounted(() => {
  loadRecentEquipment()
})

function loadRecentEquipment() {
  // 從 localStorage 載入最近查詢的設備
  const stored = localStorage.getItem('recent_equipment')
  if (stored) {
    try {
      recentEquipment.value = JSON.parse(stored)
    } catch (err) {
      console.error('Failed to load recent equipment:', err)
    }
  }
}

function saveToRecent(equipment) {
  // 儲存到最近查詢（最多保留 5 個）
  const recent = recentEquipment.value.filter(eq => eq.id !== equipment.id)
  recent.unshift(equipment)
  recentEquipment.value = recent.slice(0, 5)
  localStorage.setItem('recent_equipment', JSON.stringify(recentEquipment.value))
}

function handleSubmit() {
  const id = equipmentId.value.trim()
  if (!id) return

  processEquipmentId(id)
}

function selectRecentEquipment(equipment) {
  processEquipmentId(equipment.id)
}

function processEquipmentId(id) {
  // 從設備清單中查找設備
  const equipment = equipmentStore.getEquipmentById(id)

  if (equipment) {
    // 儲存到最近查詢
    saveToRecent(equipment)

    // 導向檢查表單頁面
    router.push({
      name: 'inspection-form',
      params: {
        categoryId: equipment.categoryId,
        equipmentId: id
      }
    })
  } else {
    // 無法識別的設備編號
    alert(`找不到設備編號: ${id}\n\n請確認編號是否正確。\n\n提示：設備編號格式為「區域-區-編號」，例如 A23A1-01-1`)
    equipmentId.value = ''
  }
}
</script>
