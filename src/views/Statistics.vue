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
            <h1 class="text-xl font-bold text-gray-900">統計報表</h1>
            <p class="text-sm text-gray-600">本月巡檢數據分析</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto p-4 pb-20 bg-gray-50">
      <!-- 1. 任務完成率（圓餅圖） -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-2xl">📊</span>
          任務完成率
        </h2>

        <!-- 圓餅圖 -->
        <div class="flex items-center justify-center mb-6">
          <div class="relative w-48 h-48">
            <!-- 圓餅圖 SVG -->
            <svg viewBox="0 0 100 100" class="transform -rotate-90">
              <!-- 已完成 (綠色) -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                :stroke-dasharray="`${taskCompletion.completedPercentage * 2.513} 251.3`"
                stroke-dashoffset="0"
                stroke-width="20"
                stroke="#10b981"
              />
              <!-- 未完成 (灰色) -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                :stroke-dasharray="`${taskCompletion.pendingPercentage * 2.513} 251.3`"
                :stroke-dashoffset="`${-taskCompletion.completedPercentage * 2.513}`"
                stroke-width="20"
                stroke="#e5e7eb"
              />
              <!-- 逾期完成 (橙色) -->
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                :stroke-dasharray="`${taskCompletion.overduePercentage * 2.513} 251.3`"
                :stroke-dashoffset="`${-(taskCompletion.completedPercentage + taskCompletion.pendingPercentage) * 2.513}`"
                stroke-width="20"
                stroke="#f59e0b"
              />
            </svg>
            <!-- 中心文字 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-3xl font-bold text-gray-900">{{ taskCompletion.completedPercentage }}%</div>
              <div class="text-xs text-gray-500">完成率</div>
            </div>
          </div>
        </div>

        <!-- 圖例 -->
        <div class="grid grid-cols-3 gap-3 text-center">
          <div>
            <div class="flex items-center justify-center gap-2 mb-1">
              <div class="w-3 h-3 rounded-full bg-green-500"></div>
              <span class="text-xs text-gray-600">已完成</span>
            </div>
            <div class="text-lg font-bold text-gray-900">{{ taskCompletion.completed }}</div>
          </div>
          <div>
            <div class="flex items-center justify-center gap-2 mb-1">
              <div class="w-3 h-3 rounded-full bg-gray-300"></div>
              <span class="text-xs text-gray-600">未完成</span>
            </div>
            <div class="text-lg font-bold text-gray-900">{{ taskCompletion.pending }}</div>
          </div>
          <div>
            <div class="flex items-center justify-center gap-2 mb-1">
              <div class="w-3 h-3 rounded-full bg-orange-500"></div>
              <span class="text-xs text-gray-600">逾期完成</span>
            </div>
            <div class="text-lg font-bold text-gray-900">{{ taskCompletion.overdue }}</div>
          </div>
        </div>
      </div>

      <!-- 2. 巡檢缺失趨勢（折線圖） -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-2xl">📈</span>
          巡檢缺失趨勢
        </h2>

        <!-- 折線圖 -->
        <div class="relative h-48 mb-4">
          <!-- Y 軸刻度 -->
          <div class="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
            <span>{{ defectTrend.maxCount }}</span>
            <span>{{ Math.floor(defectTrend.maxCount / 2) }}</span>
            <span>0</span>
          </div>

          <!-- 圖表區域 -->
          <div class="ml-10 h-full border-l border-b border-gray-200 relative">
            <svg class="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <!-- 折線 -->
              <polyline
                :points="defectTrend.points"
                fill="none"
                stroke="#ef4444"
                stroke-width="2"
                class="transition-all"
              />
              <!-- 數據點 -->
              <circle
                v-for="(point, index) in defectTrend.dataPoints"
                :key="index"
                :cx="point.x"
                :cy="point.y"
                r="4"
                fill="#ef4444"
                class="transition-all"
              />
            </svg>
          </div>
        </div>

        <!-- X 軸標籤 -->
        <div class="ml-10 flex justify-between text-xs text-gray-600">
          <span v-for="day in defectTrend.labels" :key="day">{{ day }}</span>
        </div>

        <!-- 統計摘要 -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="bg-red-50 rounded-lg p-3 text-center">
            <div class="text-xs text-red-600 mb-1">本月缺失總數</div>
            <div class="text-2xl font-bold text-red-700">{{ defectTrend.totalDefects }}</div>
          </div>
          <div class="bg-orange-50 rounded-lg p-3 text-center">
            <div class="text-xs text-orange-600 mb-1">平均每日缺失</div>
            <div class="text-2xl font-bold text-orange-700">{{ defectTrend.avgPerDay }}</div>
          </div>
        </div>
      </div>

      <!-- 3. 缺失類型分佈（長條圖） -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-2xl">📊</span>
          缺失類型分佈
        </h2>

        <!-- 長條圖 -->
        <div class="space-y-4">
          <div v-for="defect in defectDistribution" :key="defect.name">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span>{{ defect.icon }}</span>
                <span class="font-medium text-gray-900 text-sm">{{ defect.name }}</span>
              </div>
              <span class="text-sm font-bold text-red-600">{{ defect.count }} 件</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-red-400 to-red-500 transition-all rounded-full flex items-center justify-end pr-2"
                  :style="{ width: defect.percentage + '%' }"
                >
                  <span v-if="defect.percentage > 20" class="text-xs font-medium text-white">
                    {{ defect.percentage }}%
                  </span>
                </div>
              </div>
              <span v-if="defect.percentage <= 20" class="text-xs font-medium text-gray-600 w-12 text-right">
                {{ defect.percentage }}%
              </span>
            </div>
          </div>

          <div v-if="defectDistribution.length === 0" class="text-center py-8 text-gray-500">
            本月無缺失記錄
          </div>
        </div>
      </div>

      <!-- 4. 設備妥善率（KPI 大字報 + 圓餅圖） -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-2xl">🎯</span>
          設備妥善率
        </h2>

        <!-- 整體妥善率大字報 -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center mb-6 shadow-lg">
          <div class="text-sm text-blue-100 mb-2">整體設備妥善率</div>
          <div class="text-5xl font-bold text-white mb-1">{{ equipmentReadiness.overall }}%</div>
          <div class="text-xs text-blue-100">
            {{ equipmentReadiness.normalItems }} / {{ equipmentReadiness.totalItems }} 項目正常
          </div>
        </div>

        <!-- 各類別妥善率 -->
        <div class="space-y-3">
          <div
            v-for="cat in equipmentReadiness.byCategory"
            :key="cat.name"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div class="text-2xl">{{ cat.icon }}</div>
            <div class="flex-1">
              <div class="font-medium text-gray-900 text-sm mb-1">{{ cat.name }}</div>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    :class="[
                      'h-full transition-all rounded-full',
                      cat.rate >= 95 ? 'bg-green-500' :
                      cat.rate >= 80 ? 'bg-yellow-500' :
                      'bg-red-500'
                    ]"
                    :style="{ width: cat.rate + '%' }"
                  ></div>
                </div>
                <span class="text-xs font-bold text-gray-700 w-12 text-right">{{ cat.rate }}%</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ cat.normal }}/{{ cat.total }}</div>
            </div>
          </div>

          <div v-if="equipmentReadiness.byCategory.length === 0" class="text-center py-8 text-gray-500">
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
import { useEquipmentStore } from '../stores/equipment'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()
const inspectionStore = useInspectionStore()
const categoriesStore = useCategoriesStore()
const equipmentStore = useEquipmentStore()

function goBack() {
  router.push('/')
}

// 取得本月檢查記錄
const thisMonthInspections = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return inspectionStore.inspections.filter(log => {
    const logDate = new Date(log.created_at)
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear
  })
})

// 1. 任務完成率
const taskCompletion = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // 計算本月應檢查的設備數量（假設每個設備每月檢查一次）
  const totalEquipment = equipmentStore.equipmentList.length

  // 本月已檢查的設備（不重複）
  const checkedEquipmentIds = new Set()
  const overdueChecks = [] // 逾期完成的檢查（假設超過當月20號才完成視為逾期）

  thisMonthInspections.value.forEach(log => {
    checkedEquipmentIds.add(log.equipment_id)
    const logDate = new Date(log.created_at)
    if (logDate.getDate() > 20) {
      overdueChecks.push(log.equipment_id)
    }
  })

  const completed = checkedEquipmentIds.size - overdueChecks.length
  const overdue = overdueChecks.length
  const pending = totalEquipment - checkedEquipmentIds.size
  const total = totalEquipment

  return {
    completed,
    overdue,
    pending,
    total,
    completedPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    overduePercentage: total > 0 ? Math.round((overdue / total) * 100) : 0,
    pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0
  }
})

// 2. 巡檢缺失趨勢（本月每週）
const defectTrend = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // 生成本月每週的數據（簡化為每5天一個數據點）
  const weeks = []
  const weekData = []

  for (let day = 1; day <= 30; day += 5) {
    const startDate = new Date(currentYear, currentMonth, day)
    const endDate = new Date(currentYear, currentMonth, day + 4)

    const defects = thisMonthInspections.value.filter(log => {
      const logDate = new Date(log.created_at)
      return log.status === 'fail' && logDate >= startDate && logDate <= endDate
    }).length

    weeks.push(`${day}日`)
    weekData.push(defects)
  }

  const maxCount = Math.max(...weekData, 1)
  const totalDefects = thisMonthInspections.value.filter(log => log.status === 'fail').length
  const avgPerDay = Math.round(totalDefects / now.getDate())

  // 生成折線圖的點座標
  const points = weekData.map((count, index) => {
    const x = (index / (weekData.length - 1)) * 100
    const y = 100 - (count / maxCount) * 100
    return `${x},${y}`
  }).join(' ')

  const dataPoints = weekData.map((count, index) => ({
    x: `${(index / (weekData.length - 1)) * 100}%`,
    y: `${100 - (count / maxCount) * 100}%`
  }))

  return {
    labels: weeks,
    data: weekData,
    points,
    dataPoints,
    maxCount,
    totalDefects,
    avgPerDay
  }
})

// 3. 缺失類型分佈
const defectDistribution = computed(() => {
  const distribution = {}
  const categories = categoriesStore.categories

  // 計算各類別的缺失數量
  thisMonthInspections.value.forEach(log => {
    if (log.status === 'fail') {
      const category = categories.find(cat => cat.id === log.category_id)
      
      if (category) {
        // [NEW] 如果是區域檢查(16)且有子類別，使用子類別名稱
        let displayName = category.name
        let displayIcon = category.icon

        if (log.category_id === '16' && log.sub_category) {
          displayName = `${log.sub_category} (區域)`
          // 嘗試找對應圖示（雖然後端沒存圖示，這裡可以用簡單映射或共用區域圖示）
          displayIcon = getSubCategoryIcon(log.sub_category) || '📍'
        }

        if (!distribution[displayName]) {
          distribution[displayName] = {
            name: displayName,
            icon: displayIcon,
            count: 0
          }
        }
        distribution[displayName].count++
      }
    }
  })

  // 輔助函數：取得子類別圖示
  function getSubCategoryIcon(name) {
    const icons = {
      '事務機': '📠', '文具櫃': '📁', '植栽': '🌿', 
      '環境清潔': '🧹', '冰箱': '🧊', '咖啡機': '☕'
    }
    return icons[name]
  }

  const result = Object.values(distribution)
  const maxCount = Math.max(...result.map(d => d.count), 1)

  return result
    .map(d => ({
      ...d,
      percentage: Math.round((d.count / maxCount) * 100)
    }))
    .sort((a, b) => b.count - a.count)
})

// 4. 設備妥善率
const equipmentReadiness = computed(() => {
  const categories = categoriesStore.categories
  const byCategory = []

  let totalNormalItems = 0
  let totalItems = 0

  categories.forEach(category => {
    // [NEW] 如果是區域類別(16)，則嘗試根據 sub_category 拆分統計
    if (category.id === '16') {
      // 1. 找出所有區域檢查記錄
      const areaInspections = thisMonthInspections.value.filter(
        log => log.category_id === '16'
      )
      
      // 2. 根據 sub_category 分組
      const subGroups = {}
      areaInspections.forEach(log => {
        const subName = log.sub_category || '其他'
        if (!subGroups[subName]) subGroups[subName] = []
        subGroups[subName].push(log)
      })

      // 3. 對每個子群組計算妥善率
      Object.entries(subGroups).forEach(([subName, logs]) => {
        let normal = 0
        let total = 0
        
        logs.forEach(log => {
          const inspectionData = log.inspection_data || {}
          // 注意：這裡無法輕易取得 form_config，只能遍歷數據中的 boolean 值
          // 這是一個折衷方案，假設所有 true/false 都是檢查項目
          Object.values(inspectionData).forEach(val => {
            if (typeof val === 'boolean') {
              total++
              if (val === true) normal++
            }
          })
        })

        if (total > 0) {
          totalNormalItems += normal
          totalItems += total
          const rate = Math.round((normal / total) * 100)
          
          byCategory.push({
            name: `${subName}`,
            icon: getSubCategoryIcon(subName) || '📍', // 使用上面定義的輔助函數
            normal,
            total,
            rate
          })
        }
      })
      
      // 不再將 "區域" 作為一個整體加入，除非沒有子類別數據
      if (areaInspections.length === 0) {
         // show nothing or empty
      }

    } else {
      // 原有邏輯：一般類別
      const categoryInspections = thisMonthInspections.value.filter(
        log => log.category_id === category.id
      )

      if (categoryInspections.length === 0) return

      let normal = 0
      let total = 0

      categoryInspections.forEach(log => {
        const inspectionData = log.inspection_data || {}
        const fields = category.form_config?.fields || []

        fields.forEach(field => {
          if (field.type === 'checkbox') {
            total++
            if (inspectionData[field.id] === true) {
              normal++
            }
          }
        })
      })

      totalNormalItems += normal
      totalItems += total

      const rate = total > 0 ? Math.round((normal / total) * 100) : 0

      byCategory.push({
        name: category.name,
        icon: category.icon,
        normal,
        total,
        rate
      })
    }
  })

  // 輔助函數 (需要在 setup 範圍內定義一次或移到外部)
  function getSubCategoryIcon(name) {
    const icons = {
      '事務機': '📠', '文具櫃': '📁', '植栽': '🌿', 
      '環境清潔': '🧹', '冰箱': '🧊', '咖啡機': '☕'
    }
    return icons[name]
  }

  const overall = totalItems > 0 ? Math.round((totalNormalItems / totalItems) * 100) : 0

  return {
    overall,
    normalItems: totalNormalItems,
    totalItems,
    byCategory: byCategory.sort((a, b) => a.rate - b.rate)
  }
})

onMounted(async () => {
  await inspectionStore.loadInspections()
  await categoriesStore.loadCategories()
  await equipmentStore.loadEquipment()
})
</script>
