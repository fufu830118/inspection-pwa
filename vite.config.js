import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0',  // 允許網路訪問
    open: true,
    strictPort: true,  // 強制使用 5173，不自動換 port
    proxy: {
      '/oauth-proxy': {
        target: 'https://one.wiwynn.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/oauth-proxy/, '/oauth/v2.0'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('[Proxy] Request:', req.method, req.url)
          })
        }
      }
    }
  }
})
