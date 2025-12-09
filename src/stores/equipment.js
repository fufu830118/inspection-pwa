import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useInspectionStore } from './inspection'

export const useEquipmentStore = defineStore('equipment', () => {
  // State - 滅火器設備清單 (從 CSV 匯入的實際數據 - 共 128 台)
  const equipmentList = ref([
    // A23 區域 - 17 台
    { id: 'A23A1-01-1', categoryId: '1', location: 'A23FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A1-01-2', categoryId: '1', location: 'A23FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A1-02-1', categoryId: '1', location: 'A23FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A1-03-1', categoryId: '1', location: 'A23FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A2-01-1', categoryId: '1', location: 'A23FA2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A2-01-2', categoryId: '1', location: 'A23FA2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A2-02-1', categoryId: '1', location: 'A23FA2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A2-03-1', categoryId: '1', location: 'A23FA2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A3-01-1', categoryId: '1', location: 'A23FA3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A3-01-2', categoryId: '1', location: 'A23FA3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A3-02-1', categoryId: '1', location: 'A23FA3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A3-03-1', categoryId: '1', location: 'A23FA3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A3-04-1', categoryId: '1', location: 'A23FA3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A4-01-1', categoryId: '1', location: 'A23FA4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A4-01-2', categoryId: '1', location: 'A23FA4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A4-02-1', categoryId: '1', location: 'A23FA4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },
    { id: 'A23A4-03-1', categoryId: '1', location: 'A23FA4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/26' },

    // A3 區域 - 6 台
    { id: 'A3A1-01-1', categoryId: '1', location: 'A3FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'A3A1-02-1', categoryId: '1', location: 'A3FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'A3A1-03-1', categoryId: '1', location: 'A3FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'A3A1-04-1', categoryId: '1', location: 'A3FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'A3A1-05-1', categoryId: '1', location: 'A3FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'A3A1-06-1', categoryId: '1', location: 'A3FA1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },

    // C8 區域 - 29 台
    { id: 'C8C1-01-1', categoryId: '1', location: 'C8FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C1-01-2', categoryId: '1', location: 'C8FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C1-02-1', categoryId: '1', location: 'C8FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C1-03-1', categoryId: '1', location: 'C8FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C1-04-1', categoryId: '1', location: 'C8FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C1-05-1', categoryId: '1', location: 'C8FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C2-01-1', categoryId: '1', location: 'C8FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C2-01-2', categoryId: '1', location: 'C8FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C2-02-1', categoryId: '1', location: 'C8FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C2-03-1', categoryId: '1', location: 'C8FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C2-04-1', categoryId: '1', location: 'C8FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-01-1', categoryId: '1', location: 'C8FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-01-2', categoryId: '1', location: 'C8FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-02-1', categoryId: '1', location: 'C8FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-03-1', categoryId: '1', location: 'C8FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-04-1', categoryId: '1', location: 'C8FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-05-1', categoryId: '1', location: 'CF8C3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C3-06-1', categoryId: '1', location: 'C8FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-01-1', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-01-2', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-02-1', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-03-1', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-04-1', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-05-1', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C8C4-06-1', categoryId: '1', location: 'C8FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },

    // C7 區域 - 16 台
    { id: 'C7C1-01-1', categoryId: '1', location: 'C7FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C1-01-2', categoryId: '1', location: 'C7FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C1-02-1', categoryId: '1', location: 'C7FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C1-03-1', categoryId: '1', location: 'C7FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C1-04-1', categoryId: '1', location: 'C7FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-01-1', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-01-2', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-02-1', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-03-1', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-04-1', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-05-1', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C3-06-1', categoryId: '1', location: 'C7FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C4-01-1', categoryId: '1', location: 'C7FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C4-02-1', categoryId: '1', location: 'C7FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C4-03-1', categoryId: '1', location: 'C7FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C7C4-04-1', categoryId: '1', location: 'C7FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },

    // C3 區域 - 9 台 (包含 HFC-236 和 NAF-10 特殊類型)
    { id: 'C3C2-01-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-02-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-03-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-04-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-05-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-06-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-07-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-08-1', categoryId: '1', location: 'C3FC2區', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C3C2-09-1', categoryId: '1', location: 'C3FC2區', name: 'NAF-10 滅火器 10型', type: 'NAF-10', size: '10型', expiryDate: 'NA' },

    // C2 區域 - 11 台 (包含特殊位置: QT Lab、風洞、訓練教室)
    { id: 'C2C1-01-1', categoryId: '1', location: 'C2FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2C1-02-1', categoryId: '1', location: 'C2FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2C1-03-1', categoryId: '1', location: 'C2FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2C1-04-1', categoryId: '1', location: 'C2FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2C1-05-1', categoryId: '1', location: 'C2FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2QT-01-1', categoryId: '1', location: 'C2F QT Lab', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C2QT-02-1', categoryId: '1', location: 'C2F QT Lab', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C2WT-01-1', categoryId: '1', location: 'C2F風洞', name: 'HFC-236 滅火器 10型', type: 'HFC-236', size: '10型', expiryDate: 'NA' },
    { id: 'C2TR-01-1', categoryId: '1', location: 'C2F訓練教室', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2TR-02-1', categoryId: '1', location: 'C2F訓練教室', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },
    { id: 'C2TR-03-1', categoryId: '1', location: 'C2F訓練教室', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/28' },

    // C24 區域 - 9 台
    { id: 'C24C1-01-1', categoryId: '1', location: 'C24FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C1-02-1', categoryId: '1', location: 'C24FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C1-03-1', categoryId: '1', location: 'C24FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C1-04-1', categoryId: '1', location: 'C24FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C2-01-1', categoryId: '1', location: 'C24FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C2-02-1', categoryId: '1', location: 'C24FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C2-03-1', categoryId: '1', location: 'C24FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C2-04-1', categoryId: '1', location: 'C24FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },
    { id: 'C24C2-05-1', categoryId: '1', location: 'C24FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/13' },

    // B3 區域 (B3F Lab) - 10 台
    { id: 'B3-01-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/04' },
    { id: 'B3-01-2', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/04' },
    { id: 'B3-02-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2026/10/06' },
    { id: 'B3-03-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2026/10/06' },
    { id: 'B3-04-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2026/10/06' },
    { id: 'B3-05-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/05' },
    { id: 'B3-06-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/04' },
    { id: 'B3-07-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2026/10/06' },
    { id: 'B3-08-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/05' },
    { id: 'B3-09-2', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/04' },
    { id: 'B3-10-1', categoryId: '1', location: 'B3F Lab', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/04' },

    // C26 區域 - 21 台
    { id: 'C26C1-01-1', categoryId: '1', location: 'C26FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C1-02-1', categoryId: '1', location: 'C26FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C1-03-1', categoryId: '1', location: 'C26FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C1-04-1', categoryId: '1', location: 'C26FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C1-05-1', categoryId: '1', location: 'C26FC1區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C2-01-1', categoryId: '1', location: 'C26FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C2-02-1', categoryId: '1', location: 'C26FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C2-03-1', categoryId: '1', location: 'C26FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C2-04-1', categoryId: '1', location: 'C26FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C2-05-1', categoryId: '1', location: 'C26FC2區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/05' },
    { id: 'C26C3-01-1', categoryId: '1', location: 'C26FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C3-02-1', categoryId: '1', location: 'C26FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/15' },
    { id: 'C26C3-03-1', categoryId: '1', location: 'C26FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C3-04-1', categoryId: '1', location: 'C26FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/15' },
    { id: 'C26C3-05-1', categoryId: '1', location: 'C26FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2028/04' },
    { id: 'C26C3-06-1', categoryId: '1', location: 'C26FC3區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/15' },
    { id: 'C26C4-01-1', categoryId: '1', location: 'C26FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C4-02-1', categoryId: '1', location: 'C26FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/10/23' },
    { id: 'C26C4-03-1', categoryId: '1', location: 'C26FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' },
    { id: 'C26C4-04-1', categoryId: '1', location: 'C26FC4區', name: '乾粉滅火器 20型', type: '乾粉', size: '20型', expiryDate: '2027/11/08' }
  ])

  const isLoading = ref(false)

  // Getters
  // 根據類別ID獲取該類別的所有設備
  const getEquipmentByCategory = computed(() => {
    return (categoryId) => {
      return equipmentList.value.filter(eq => eq.categoryId === categoryId)
    }
  })

  // 獲取每個類別的檢查進度
  const getCategoryProgress = computed(() => {
    return (categoryId) => {
      const inspectionStore = useInspectionStore()
      const equipment = equipmentList.value.filter(eq => eq.categoryId === categoryId)
      const total = equipment.length

      if (total === 0) return { checked: 0, total: 0, percentage: 0 }

      // 獲取本月已檢查的設備
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const checkedEquipment = equipment.filter(eq => {
        // 檢查該設備本月是否有檢查記錄
        return inspectionStore.inspections.some(log => {
          const logDate = new Date(log.created_at)
          return log.equipment_id === eq.id &&
                 logDate.getMonth() === currentMonth &&
                 logDate.getFullYear() === currentYear
        })
      })

      const checked = checkedEquipment.length
      const percentage = Math.round((checked / total) * 100)

      return { checked, total, percentage }
    }
  })

  // 獲取本月未檢查的設備列表
  const getUncheckedEquipment = computed(() => {
    return (categoryId) => {
      const inspectionStore = useInspectionStore()
      const equipment = equipmentList.value.filter(eq => eq.categoryId === categoryId)

      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      return equipment.filter(eq => {
        // 檢查該設備本月是否沒有檢查記錄
        return !inspectionStore.inspections.some(log => {
          const logDate = new Date(log.created_at)
          return log.equipment_id === eq.id &&
                 logDate.getMonth() === currentMonth &&
                 logDate.getFullYear() === currentYear
        })
      })
    }
  })

  // Actions
  function getEquipmentById(equipmentId) {
    return equipmentList.value.find(eq => eq.id === equipmentId)
  }

  async function loadEquipment() {
    isLoading.value = true
    try {
      // TODO: 從 Supabase 載入
      // 目前使用靜態資料
      await new Promise(resolve => setTimeout(resolve, 300))
      return equipmentList.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    equipmentList,
    isLoading,
    getEquipmentByCategory,
    getCategoryProgress,
    getUncheckedEquipment,
    getEquipmentById,
    loadEquipment
  }
})
