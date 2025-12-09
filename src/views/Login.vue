<template>
  <div class="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary-50 to-white">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">📋</div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">巡檢系統</h1>
        <p class="text-gray-600">Wiwynn Inspection PWA</p>
      </div>

      <!-- Login Card -->
      <div class="card space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">歡迎使用</h2>
          <p class="text-sm text-gray-600">
            請使用 Wiwynn 員工帳號登入
          </p>
        </div>

        <button
          @click="handleLogin"
          :disabled="isLoading"
          class="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <svg v-else class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? '登入中...' : '使用 Wiwynn 帳號登入' }}
        </button>

        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>使用 OAuth 2.0 安全認證</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getAuthorizationUrl } from '../config/oauth'

const isLoading = ref(false)
const error = ref(null)

function handleLogin() {
  try {
    isLoading.value = true
    error.value = null

    const authUrl = getAuthorizationUrl()
    window.location.href = authUrl
  } catch (err) {
    error.value = '登入失敗，請稍後再試'
    console.error('Login error:', err)
    isLoading.value = false
  }
}
</script>
