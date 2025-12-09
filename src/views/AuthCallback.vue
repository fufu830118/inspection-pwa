<template>
  <div class="h-full flex items-center justify-center p-6">
    <div class="text-center">
      <div v-if="!error" class="space-y-4">
        <svg class="animate-spin h-12 w-12 text-primary-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">正在登入中...</p>
      </div>

      <div v-else class="card max-w-md">
        <div class="text-5xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">登入失敗</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <button
          @click="$router.push('/login')"
          class="btn btn-primary w-full"
        >
          重新登入
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const error = ref(null)

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  const errorParam = urlParams.get('error')
  const errorDescription = urlParams.get('error_description')

  if (errorParam) {
    error.value = errorDescription || errorParam
    return
  }

  if (!code) {
    error.value = '未收到授權碼'
    return
  }

  // 驗證 state
  const savedState = sessionStorage.getItem('oauth_state')
  if (savedState && state && savedState !== state) {
    error.value = 'State 驗證失敗，可能存在安全風險'
    return
  }

  // 交換 token
  try {
    const success = await authStore.exchangeToken(code)
    if (success) {
      // 清除 state
      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_nonce')

      // 導向首頁
      router.push('/')
    } else {
      error.value = authStore.error || '登入失敗'
    }
  } catch (err) {
    error.value = '登入過程發生錯誤'
    console.error('Auth callback error:', err)
  }
})
</script>
