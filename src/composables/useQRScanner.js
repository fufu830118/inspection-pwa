import { ref, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

export function useQRScanner() {
  const html5QrCode = ref(null)
  const isScanning = ref(false)
  const error = ref(null)

  async function startScanning(elementId, onSuccess, onError) {
    try {
      error.value = null
      html5QrCode.value = new Html5Qrcode(elementId)

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      await html5QrCode.value.start(
        { facingMode: 'environment' }, // 後置鏡頭
        config,
        (decodedText) => {
          onSuccess(decodedText)
        },
        (errorMessage) => {
          // 解碼失敗是正常的，不需要處理
        }
      )

      isScanning.value = true
    } catch (err) {
      error.value = err.message || '無法啟動相機'
      if (onError) {
        onError(err)
      }
    }
  }

  async function stopScanning() {
    if (html5QrCode.value && isScanning.value) {
      try {
        await html5QrCode.value.stop()
        html5QrCode.value.clear()
        isScanning.value = false
      } catch (err) {
        console.error('停止掃描時發生錯誤:', err)
      }
    }
  }

  onUnmounted(() => {
    stopScanning()
  })

  return {
    isScanning,
    error,
    startScanning,
    stopScanning
  }
}
