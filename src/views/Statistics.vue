<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <header class="flex-shrink-0 bg-white border-b border-gray-200 safe-top">
      <div class="px-4 py-4">
        <div class="flex items-center gap-3">
          <button
            @click="goBack"
            class="p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 class="text-xl font-bold text-gray-900">統計數據</h1>
            <p class="text-sm text-gray-600">檢查統計與分析</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 pb-20">
      <!-- Time Period Selector -->
      <div class="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label class="block text-sm font-medium text-gray-700 mb-3">統計期間</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="period in periods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="[
              'py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              selectedPeriod === period.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            ]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-sm text-blue-100 mb-1">總檢查次數</div>
          <div class="text-3xl font-bold">{{ stats.total }}</div>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-sm text-green-100 mb-1">合格率</div>
          <div class="text-3xl font-bold">{{ stats.passRate }}%</div>
        </div>
        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-sm text-emerald-100 mb-1">合格</div>
          <div class="text-3xl font-bold">{{ stats.passed }}</div>
        </div>
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
          <div class="text-sm text-red-100 mb-1">異常</div>
          <div class="text-3xl font-bold">{{ stats.failed }}</div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">各類別統計</h2>
        <div class="space-y-4">
          <div
            v-for="cat in categoryStats"
            :key="cat.id"
            class="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-gray-900">{{ cat.name }}</div>
              <div class="text-sm text-gray-600">{{ cat.count }} 次</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                  :style="{ width: cat.passRate + '%' }"
                ></div>
              </div>
              <div class="text-sm font-medium text-gray-700 min-w-[45px] text-right">
                {{ cat.passRate }}%
              </div>
            </div>
          </div>
          <div v-if="categoryStats.length === 0" class="text-center py-8 text-gray-500">
            暫無數據
          </div>
        </div>
      </div>

      <!-- Inspector Ranking -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">檢查人員排行</h2>
        <div class="space-y-3">
          <div
            v-for="(inspector, index) in inspectorRanking"
            :key="inspector.name"
            class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <div
              :class="[
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-700' :
                index === 2 ? 'bg-orange-400 text-orange-900' :
                'bg-gray-200 text-gray-600'
              ]"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate">{{ inspector.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ inspector.email }}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-gray-900">{{ inspector.count }}</div>
              <div class="text-xs text-gray-500">次檢查</div>
            </div>
          </div>
          <div v-if="inspectorRanking.length === 0" class="text-center py-8 text-gray-500">
            暫無數據
          </div>
        </div>
      </div>

      <!-- Daily Trend -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">每日檢查趨勢</h2>
        <div class="space-y-2">
          <div
            v-for="day in dailyTrend"
            :key="day.date"
            class="flex items-center gap-3"
          >
            <div class="text-sm text-gray-600 w-20">{{ day.dateLabel }}</div>
            <div class="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                class="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all"
                :style="{ width: day.percentage + '%' }"
              ></div>
              <div class="absolute inset-0 flex items-center px-3 text-sm font-medium text-gray-700">
                {{ day.count }}
              </div>
            </div>
          </div>
          <div v-if="dailyTrend.length === 0" class="text-center py-8 text-gray-500">
            暫無數據
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
import { useInspectionStore } from '../stores/inspection'
import { useCategoriesStore } from '../stores/categories'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const inspectionStore = useInspectionStore()
const categoriesStore = useCategoriesStore()

const selectedPeriod = ref('month')

const periods = [
  { value: 'week', label: '本週' },
  { value: 'month', label: '本月' },
  { value: 'year', label: '本年' }
]

function goBack() {
  router.back()
}

// 根據選擇的期間過濾檢查記錄
const filteredInspections = computed(() => {
  const now = new Date()
  const inspections = inspectionStore.inspections

  if (selectedPeriod.value === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return inspections.filter(log => new Date(log.created_at) >= weekAgo)
  } else if (selectedPeriod.value === 'month') {
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    return inspections.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
    })
  } else {
    const currentYear = now.getFullYear()
    return inspections.filter(log => {
      const logDate = new Date(log.created_at)
      return logDate.getFullYear() === currentYear
    })
  }
})

// 總體統計
const stats = computed(() => {
  const total = filteredInspections.value.length
  const passed = filteredInspections.value.filter(log => log.status === 'pass').length
  const failed = filteredInspections.value.filter(log => log.status === 'fail').length
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

  return { total, passed, failed, passRate }
})

// 各類別統計
const categoryStats = computed(() => {
  const categories = categoriesStore.categories
  const stats = []

  categories.forEach(category => {
    const categoryInspections = filteredInspections.value.filter(
      log => log.category_id === category.id
    )
    const count = categoryInspections.length
    const passed = categoryInspections.filter(log => log.status === 'pass').length
    const passRate = count > 0 ? Math.round((passed / count) * 100) : 0

    if (count > 0) {
      stats.push({
        id: category.id,
        name: category.name,
        count,
        passed,
        passRate
      })
    }
  })

  return stats.sort((a, b) => b.count - a.count)
})

// 檢查人員排行
const inspectorRanking = computed(() => {
  const inspectorMap = new Map()

  filteredInspections.value.forEach(log => {
    const name = log.inspector_name || '未知'
    const email = log.inspector_email || ''

    if (inspectorMap.has(name)) {
      inspectorMap.get(name).count++
    } else {
      inspectorMap.set(name, { name, email, count: 1 })
    }
  })

  return Array.from(inspectorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
})

// 每日趨勢（最近7天）
const dailyTrend = computed(() => {
  const days = []
  const now = new Date()
  const maxCount = ref(0)

  // 生成最近7天的日期
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const count = filteredInspections.value.filter(log => {
      const logDate = new Date(log.created_at).toISOString().split('T')[0]
      return logDate === dateStr
    }).length

    if (count > maxCount.value) {
      maxCount.value = count
    }

    days.push({
      date: dateStr,
      dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      count
    })
  }

  // 計算百分比
  return days.map(day => ({
    ...day,
    percentage: maxCount.value > 0 ? (day.count / maxCount.value) * 100 : 0
  }))
})

onMounted(async () => {
  await inspectionStore.loadInspections()
  await categoriesStore.loadCategories()
})
</script>
