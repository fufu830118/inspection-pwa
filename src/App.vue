<template>
  <div id="app" class="h-full flex flex-col bg-gray-50">
    <router-view class="flex-1" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // 如果有 token 但沒有用戶資訊，嘗試獲取
  if (authStore.accessToken && !authStore.user) {
    authStore.fetchUserInfo()
  }
})
</script>
