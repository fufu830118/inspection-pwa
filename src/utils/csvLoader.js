import Papa from 'papaparse'

/**
 * 從檢點表資料夾讀取 CSV 檔案
 * @param {string} folderName - 資料夾名稱（例如：'滅火器'）
 * @param {string} fileName - 檔案名稱（'檢點項目.csv' 或 '設備清單.csv'）
 * @returns {Promise<Array>} 解析後的 CSV 資料
 */
export async function loadCSV(folderName, fileName) {
  try {
    const response = await fetch(`/檢點表/${folderName}/${fileName}`)
    if (!response.ok) {
      throw new Error(`Failed to load ${folderName}/${fileName}`)
    }

    const csvText = await response.text()

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error(`Error loading CSV: ${folderName}/${fileName}`, error)
    throw error
  }
}

/**
 * 將檢點項目 CSV 轉換為 form_config 格式
 * @param {Array} csvData - 檢點項目 CSV 資料
 * @returns {Object} form_config 物件
 */
export function convertInspectionItemsToFormConfig(csvData) {
  // 過濾掉空白或無效的列
  const validRows = csvData.filter(row => {
    const itemName = row['項目名稱'] || ''
    const questionType = row['題型'] || ''
    // 必須有項目名稱和題型才算有效
    return itemName.trim() !== '' && questionType.trim() !== ''
  })

  const fields = validRows.map((row, index) => {
    const fieldId = `field_${index}`
    const label = row['項目名稱'] || ''
    const questionType = row['題型'] || ''
    const required = row['必填'] === '是'

    // 根據題型決定 field type
    let type = 'text'
    if (questionType === '布林') {
      type = 'checkbox'
    } else if (questionType === '數字') {
      type = 'number'
    } else if (questionType === '簡答') {
      type = 'textarea'
    }

    return {
      id: fieldId,
      label: label,
      type: type,
      required: required,
      checkPoint: row['檢查重點'] || '',
      normalStandard: row['正常標準'] || '',
      abnormalStandard: row['異常標準'] || ''
    }
  })

  return { fields }
}

/**
 * 載入所有檢點表類別
 * @returns {Promise<Array>} 類別列表
 */
export async function loadAllCategories() {
  const categoryFolders = [
    { name: '滅火器', icon: '🧯', id_prefix: 'FIREXT' },
    { name: '自動門', icon: '🚪', id_prefix: 'AUTD' },
    { name: '防火鐵捲門', icon: '🔥', id_prefix: 'FIRD' },
    { name: '逃生門', icon: '🚨', id_prefix: 'EXIT' },
    { name: '會議室', icon: '🏢', id_prefix: 'ROOM' },
    { name: '緊急沖眼器查檢表', icon: '👁️', id_prefix: 'EYE' },
    { name: '事務機', icon: '🖨️', id_prefix: 'OFA' },
    { name: '送風機', icon: '💨', id_prefix: 'FAN' },
    { name: '氣冷箱型冷氣機', icon: '❄️', id_prefix: 'CHI' },
    { name: '實驗室大電盤', icon: '⚡', id_prefix: 'LABPOW-BIG' },
    { name: '辦公室大盤和實驗室小盤', icon: '⚡', id_prefix: 'LABPOW-MIX' },
    { name: '辦公室小電盤', icon: '⚡', id_prefix: 'OFFPOW-SMALL' },
    { name: '辦公室機房電盤', icon: '⚡', id_prefix: 'OFFPOW-SERVER' },
    { name: '化學品室環境', icon: '🧪', id_prefix: 'CHEM' },
    { name: '化學品洩漏處理車', icon: '🚨', id_prefix: 'CHEMCART' }
  ]

  const categories = []

  for (let i = 0; i < categoryFolders.length; i++) {
    const folder = categoryFolders[i]
    try {
      // 讀取頻率 CSV
      let frequency = '每月' // 預設值
      try {
        const frequencyData = await loadCSV(folder.name, '頻率.csv')
        frequency = frequencyData[0]?.['頻率'] || '每月'
      } catch (err) {
        console.warn(`No frequency.csv for ${folder.name}, using default: 每月`)
      }

      // 讀取檢點項目 CSV
      const inspectionItems = await loadCSV(folder.name, '檢點項目.csv')

      // Debug: 印出載入的資料
      console.log(`[${folder.name}] 載入 ${inspectionItems.length} 個檢查項目`)
      if (inspectionItems.length > 0) {
        console.log(`[${folder.name}] 第一個項目:`, inspectionItems[0])
        console.log(`[${folder.name}] 欄位名稱:`, Object.keys(inspectionItems[0]))
      }

      // 轉換為 form_config
      const formConfig = convertInspectionItemsToFormConfig(inspectionItems)

      console.log(`[${folder.name}] 轉換後 ${formConfig.fields.length} 個欄位`)

      categories.push({
        id: String(i + 1),
        name: folder.name,
        id_prefix: folder.id_prefix,
        icon: folder.icon,
        frequency: frequency,
        form_config: formConfig
      })
    } catch (error) {
      console.warn(`Skipping ${folder.name}:`, error.message)
    }
  }

  return categories
}

/**
 * 載入指定類別的設備清單
 * @param {string} categoryName - 類別名稱
 * @returns {Promise<Array>} 設備清單
 */
export async function loadEquipmentList(categoryName) {
  try {
    // 載入基本設備清單（含 QR Code 亂碼）
    const equipmentData = await loadCSV(categoryName, '設備清單.csv')

    // 嘗試載入詳細清單（含位置、類型、有效日期等資訊）
    let detailedData = []
    try {
      detailedData = await loadCSV(categoryName, `${categoryName}詳細清單.csv`)
    } catch (err) {
      console.warn(`No detailed list for ${categoryName}`)
    }

    // 合併兩個清單的資料
    return equipmentData.map(row => {
      const baseId = row['編碼顯示'] || ''

      // 從詳細清單中尋找對應的資料
      // 設備清單格式: FIREXT-A23-A1-01-1
      // 詳細清單格式: A23A1-01-1 (移除第一個 -)
      const shortId = baseId.replace(/^[A-Z]+-/, '').replace('-', '') // FIREXT-A23-A1-01-1 -> A23A1-01-1
      const detailRow = detailedData.find(d => {
        const detailId = d['編號'] || d['條碼內容'] || ''
        return detailId === shortId
      })

      return {
        id: baseId,
        qrCode: row['亂碼'] || '',
        name: row['顯示名稱'] || detailRow?.['標題'] || categoryName,
        categoryName: categoryName,
        location: detailRow?.['位置'] || '',
        type: detailRow?.['滅火器類型'] || detailRow?.['類型'] || '',
        size: detailRow?.['尺寸'] || '',
        expiryDate: detailRow?.['有效日期'] || '',
        length: row['長度'] || '',
        width: row['寬度'] || '',
        color: row['顏色'] || ''
      }
    })
  } catch (error) {
    console.warn(`No equipment list for ${categoryName}`)
    return []
  }
}

/**
 * 載入所有設備清單
 * @returns {Promise<Array>} 所有設備列表
 */
export async function loadAllEquipment() {
  const categoryFolders = [
    '滅火器', '自動門', '防火鐵捲門', '逃生門', '會議室',
    '緊急沖眼器查檢表', '事務機', '送風機', '氣冷箱型冷氣機',
    '實驗室大電盤', '辦公室大盤和實驗室小盤', '辦公室小電盤', '辦公室機房電盤',
    '化學品室環境', '化學品洩漏處理車'
  ]

  const allEquipment = []

  for (const folder of categoryFolders) {
    const equipment = await loadEquipmentList(folder)
    allEquipment.push(...equipment)
  }

  return allEquipment
}
