<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
    <div class="flex justify-around items-center h-16">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="nav-item flex-1"
        :class="{ 'nav-item-active': isActive(item.to) }"
        active-class="nav-item-active"
      >
        <span class="text-2xl">{{ item.icon }}</span>
        <span class="text-xs font-medium">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    name: 'home',
    to: '/',
    icon: '📁',
    label: '首頁'
  },
  {
    name: 'statistics',
    to: '/statistics',
    icon: '📊',
    label: '統計數據'
  },
  {
    name: 'history',
    to: '/history',
    icon: '📋',
    label: '紀錄'
  }
]

function isActive(path) {
  return route.path === path
}
</script>

<style scoped>
.nav-item {
  @apply flex flex-col items-center justify-center gap-1 text-gray-600 transition-colors;
  min-height: 56px;
}

.nav-item-active {
  @apply text-primary-600;
}
</style>
