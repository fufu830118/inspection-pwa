import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { OAUTH_CONFIG } from '../config/oauth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.name || '')

  // Actions
  async function exchangeToken(code) {
    isLoading.value = true
    error.value = null

    try {
      // Wiwynn OAuth 使用 HTTP Basic Authentication
      const credentials = btoa(`${OAUTH_CONFIG.CLIENT_ID}:${OAUTH_CONFIG.CLIENT_SECRET}`)

      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: OAUTH_CONFIG.REDIRECT_URI
      })

      // 使用 Cloudflare Worker 代理 OAuth 請求
      const tokenUrl = import.meta.env.PROD
        ? 'https://inspection-pwa.f23022340.workers.dev/token'
        : '/oauth-proxy/token'

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`
        },
        body: params.toString()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Token exchange failed:', errorData)
        throw new Error(errorData.error_description || 'Token exchange failed')
      }

      const data = await response.json()
      accessToken.value = data.access_token
      localStorage.setItem('access_token', data.access_token)

      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }

      // 獲取用戶資訊
      await fetchUserInfo()

      return true
    } catch (err) {
      error.value = err.message
      console.error('Token exchange error:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!accessToken.value) return

    try {
      // 使用 Cloudflare Worker 代理 OAuth 請求
      const userinfoUrl = import.meta.env.PROD
        ? 'https://inspection-pwa.f23022340.workers.dev/userinfo'
        : '/oauth-proxy/userinfo'

      const response = await fetch(userinfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken.value}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user info')
      }

      const data = await response.json()
      user.value = {
        id: data.sub || data.user_id,
        name: data.name,
        email: data.email,
        email_verified: data.email_verified
      }

      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (err) {
      error.value = err.message
      console.error('Fetch user info error:', err)
    }
  }

  function logout() {
    user.value = null
    accessToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('Failed to parse stored user:', err)
      }
    }
  }

  // 初始化時載入用戶資訊
  loadUserFromStorage()

  return {
    user,
    accessToken,
    isLoading,
    error,
    isAuthenticated,
    userEmail,
    userName,
    exchangeToken,
    fetchUserInfo,
    logout
  }
})
