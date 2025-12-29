<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 safe-top">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between mb-2">
          <h1 class="text-2xl font-bold text-gray-900">巡檢系統</h1>
          <button
            @click="handleLogout"
            class="p-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-600">您好，{{ userName }}</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 pb-20">
      <!-- Categories Section -->
      <div class="space-y-3">
        <CategoryCard
          v-for="category in categories"
          :key="category.id"
          :category="category"
          @click="handleCategoryClick(category)"
        />
      </div>

      <!-- Empty State -->
      <div v-if="categories.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📋</div>
        <p class="text-gray-600">暫無檢查類別</p>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCategoriesStore } from '../stores/categories'
import { useInspectionStore } from '../stores/inspection'
import { useEquipmentStore } from '../stores/equipment'
import CategoryCard from '../components/CategoryCard.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const inspectionStore = useInspectionStore()
const equipmentStore = useEquipmentStore()

const userName = computed(() => authStore.userName)
const categories = computed(() => categoriesStore.categories)

function handleCategoryClick(category) {
  // 所有類別統一導向設備列表頁面
  router.push({
    name: 'equipment-list',
    params: { categoryId: category.id }
  })
}

function handleLogout() {
  if (confirm('確定要登出嗎？')) {
    authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  await categoriesStore.loadCategories()
  await inspectionStore.loadInspections()
  await equipmentStore.loadEquipment()
})
</script>
