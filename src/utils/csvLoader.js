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
    const itemName = row['檢查項目'] || ''
    const questionType = row['欄位類型'] || ''
    // 必須有檢查項目和欄位類型才算有效
    return itemName.trim() !== '' && questionType.trim() !== ''
  })

  const fields = validRows.map((row, index) => {
    const fieldId = `field_${index}`
    const label = row['檢查項目'] || ''
    const questionType = row['欄位類型'] || ''
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
      checkPoint: row['說明'] || '',
      normalStandard: row['合格條件'] || '',
      abnormalStandard: row['不合格條件'] || ''
    }
  })

  return { fields }
}

/**
 * 載入類別配置
 * @returns {Promise<Array>} 類別配置列表
 */
export async function loadCategoryConfig() {
  try {
    const response = await fetch(`/檢點表/類別配置.csv`)
    if (!response.ok) {
      throw new Error('Failed to load 類別配置.csv')
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
    console.error('Error loading 類別配置.csv:', error)
    throw error
  }
}

/**
 * 載入所有檢點表類別
 * @returns {Promise<Array>} 類別列表
 */
export async function loadAllCategories() {
  // 從 CSV 讀取類別配置
  const categoryConfig = await loadCategoryConfig()

  const categories = []

  for (let i = 0; i < categoryConfig.length; i++) {
    const config = categoryConfig[i]
    try {
      // 讀取檢點項目 CSV
      const inspectionItems = await loadCSV(config['類別名稱'], '檢點項目.csv')

      // Debug: 印出載入的資料
      console.log(`[${config['類別名稱']}] 載入 ${inspectionItems.length} 個檢查項目`)
      if (inspectionItems.length > 0) {
        console.log(`[${config['類別名稱']}] 第一個項目:`, inspectionItems[0])
        console.log(`[${config['類別名稱']}] 欄位名稱:`, Object.keys(inspectionItems[0]))
      }

      // 轉換為 form_config
      const formConfig = convertInspectionItemsToFormConfig(inspectionItems)

      console.log(`[${config['類別名稱']}] 轉換後 ${formConfig.fields.length} 個欄位`)

      categories.push({
        id: config['類別ID'],
        name: config['類別名稱'],
        id_prefix: config['ID前綴'],
        icon: config['圖示'],
        frequency: config['頻率'] || '每月', // 預設每月
        form_config: formConfig
      })
    } catch (error) {
      console.warn(`Skipping ${config['類別名稱']}:`, error.message)
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
    // 只載入設備清單（已包含所有詳細資訊）
    const equipmentData = await loadCSV(categoryName, '設備清單.csv')

    // 動態讀取所有欄位
    return equipmentData.map(row => {
      const equipment = {
        id: row['設備ID'] || '',
        qrCode: row['QR碼'] || '',
        categoryName: categoryName
      }

      // 動態加入所有其他欄位（自訂欄位）
      Object.keys(row).forEach(key => {
        if (key !== '設備ID' && key !== 'QR碼' && row[key]) {
          // 直接使用原來的中文欄位名，不轉換
          // UI 會根據需要顯示這些欄位
          let propName = key

          // 處理常見的欄位映射（為了向後兼容）
          if (key.includes('類型')) {
            propName = 'type'
          } else if (key === '尺寸') {
            propName = 'size'
          } else if (key === '位置') {
            propName = 'location'
          } else if (key.includes('有效日期') || key === '到期日') {
            propName = 'expiryDate'
          } else if (key.includes('規格')) {
            propName = 'spec'
          } else if (key === '廠牌') {
            propName = 'brand'
          } else if (key === '型號') {
            propName = 'model'
          } else if (key === '名稱' || key === '設備名稱') {
            propName = 'name'
          }

          equipment[propName] = row[key]
        }
      })

      return equipment
    })
  } catch (error) {
    console.warn(`No equipment list for ${categoryName}`)
    return []
  }
}

/**
 * 載入所有設備列表
 * @returns {Promise<Array>} 所有設備列表
 */
export async function loadAllEquipment() {
  try {
    const categoryConfig = await loadCategoryConfig()
    const allEquipment = []

    for (const config of categoryConfig) {
      const categoryName = config['類別名稱']

      // 跳過區域類別（區域設備單獨處理）
      if (categoryName === '區域') continue

      const equipmentList = await loadEquipmentList(categoryName)
      allEquipment.push(...equipmentList)
    }

    // 額外載入區域設備的基本資訊（用於QR Code識別）
    try {
      const response = await fetch('/檢點表/區域/區域設備詳細清單.csv')
      const csvText = (await response.text()).trim().replace(/^\uFEFF/, '')

      const areaEquipmentData = await new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (error) => reject(error)
        })
      })

      // 提取唯一的區域ID和QR碼
      const areaMap = new Map()
      areaEquipmentData.forEach(row => {
        const areaId = row['區域ID']
        if (areaId && !areaMap.has(areaId)) {
          // 從詳細清單中找到該區域的第一筆記錄來獲取QR碼
          const firstEquip = areaEquipmentData.find(e => e['區域ID'] === areaId)
          // 查找對應的QR Code
          const qrCode = getAreaQRCode(areaId)

          if (qrCode) {
            areaMap.set(areaId, {
              id: areaId,
              qrCode: qrCode,
              categoryName: '區域',
              categoryId: '16' // 區域類別ID
            })
          }
        }
      })

      // 將區域設備加入總列表
      allEquipment.push(...Array.from(areaMap.values()))

      console.log(`載入了 ${areaMap.size} 個區域設備`)
    } catch (error) {
      console.warn('載入區域設備清單失敗:', error)
    }

    return allEquipment
  } catch (error) {
    console.error('載入設備清單失敗:', error)
    throw error
  }
}

// 根據區域ID獲取對應的QR碼
function getAreaQRCode(areaId) {
  // 從 OFA 區域 QR Code 列表中查找
  const areaQRCodes = {
    'OFA-A23-A1-01': '30cf77bf1c6c3240',
    'OFA-A23-A2-01': '4f32ae0006ecb317',
    'OFA-A23-A3-01': '7bbc01c6550b4dbe',
    'OFA-A23-A4-01': 'e221797af61a3b38',
    'OFA-A3-A1-01': '298b737b6a7b07d3',
    'OFA-AB3-A1-01': '9caf419146c7ad4a',
    'OFA-C2-C1-01': '806ae1714c501217',
    'OFA-C3-C1-01': '9229c950c3c9954d',
    'OFA-C7-C1-01': 'ca5337e24b5a8832',
    'OFA-C7-C3-01': '7d738ec8bcbd7cce',
    'OFA-C7-C4-01': '41c8bb8e34aa53ea',
    'OFA-C8-C1-01': '6c5bfe92b969e42e',
    'OFA-C8-C2-01': '2967ee99a84ef34d',
    'OFA-C8-C3-01': 'e777d37b6ade6f02',
    'OFA-C8-C4-01': '7e782f0fba906df3',
    'OFA-C23-C1-01': '616ccca058a3f3d2',
    'OFA-C23-C2-01': 'fb562a76be67dc14',
    'OFA-C24-C1-01': '2d9ce15a9f8a0893',
    'OFA-C24-C2-01': '0b793a2d330193d3',
    'OFA-C26-C1-01': '6048c86759557e01',
    'OFA-C26-C2-01': 'd116bdf4b3b9df5f',
    'OFA-C26-C3-01': '984de6786769d99b',
    'OFA-C26-C4-01': '6c6da1417ae36d35'
  }

  return areaQRCodes[areaId] || ''
}
