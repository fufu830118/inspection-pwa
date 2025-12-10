// OAuth 配置 - 使用 Wiwynn OAuth Server
// 注意：敏感資訊應使用環境變數，不應直接提交到 Git

// 動態取得 Redirect URI（支援電腦和手機）
function getRedirectUri() {
  // 優先使用環境變數
  if (import.meta.env.VITE_OAUTH_REDIRECT_URI) {
    return import.meta.env.VITE_OAUTH_REDIRECT_URI
  }
  // 否則使用當前頁面的 origin
  return `${window.location.origin}/auth/callback`
}

export const OAUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_OAUTH_CLIENT_SECRET || '',
  get REDIRECT_URI() {
    return getRedirectUri()
  },
  AUTHORIZE_URL: import.meta.env.VITE_OAUTH_AUTHORIZE_URL || 'https://one.wiwynn.com/oauth/v2.0/authorize',
  TOKEN_URL: import.meta.env.VITE_OAUTH_TOKEN_URL || 'https://one.wiwynn.com/oauth/v2.0/token',
  USERINFO_URL: import.meta.env.VITE_OAUTH_USERINFO_URL || 'https://one.wiwynn.com/oauth/v2.0/userinfo',
  SCOPE: 'openid email'
}

// 生成隨機字串
export function generateRandomString() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// OAuth URL 生成
export function getAuthorizationUrl() {
  const state = generateRandomString()
  const nonce = generateRandomString()

  sessionStorage.setItem('oauth_state', state)
  sessionStorage.setItem('oauth_nonce', nonce)

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.CLIENT_ID,
    redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
    response_type: 'code',
    scope: OAUTH_CONFIG.SCOPE,
    state,
    nonce
  })

  return `${OAUTH_CONFIG.AUTHORIZE_URL}?${params.toString()}`
}
