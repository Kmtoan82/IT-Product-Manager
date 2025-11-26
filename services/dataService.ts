import Papa from 'papaparse';
import { ProductData, RawInventory, RawPricing, RawProductInfo, AppConfig, ShopType, FeeCategory } from '../types';
import { getFeeCategories } from './feeTables';

// Helper to parse CSV string
export const parseCSV = <T>(csvString: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically converts numbers
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Constants for Fees (As per user requirements)
const PAYMENT_FEE_PERCENT = 4.91;
const SERVICE_FEE_PERCENT = 2.5;
const SERVICE_FEE_CAP = 50000;
const FIXED_INFRA_FEE = 3000 + 1620; // 4,620 VND

const calculateFee = (price: number, fixedRatePercent: number, useVoucherExtra: boolean): number => {
  if (price <= 0) return 0;

  // 1. Payment Fee
  const paymentFee = price * (PAYMENT_FEE_PERCENT / 100);

  // 2. Fixed Fee (Category based)
  const fixedFee = price * (fixedRatePercent / 100);

  // 3. Service Fee (Voucher Extra)
  let serviceFee = 0;
  if (useVoucherExtra) {
    const rawServiceFee = price * (SERVICE_FEE_PERCENT / 100);
    serviceFee = Math.min(rawServiceFee, SERVICE_FEE_CAP);
  }

  // 4. Infrastructure Fee
  const infraFee = FIXED_INFRA_FEE;

  return paymentFee + fixedFee + serviceFee + infraFee;
};

// Merging Logic
export const mergeData = (
  info: RawProductInfo[],
  inventory: RawInventory[],
  pricing: RawPricing[],
  config: AppConfig,
  existingData: ProductData[] = [] // Pass existing data to preserve category selections
): ProductData[] => {
  const productMap = new Map<string, Partial<ProductData>>();

  // Load existing choices to preserve them during re-merge
  const existingCategoryMap = new Map<string, string>();
  existingData.forEach(p => {
    if (p.feeCategoryId) {
      existingCategoryMap.set(p.sku, p.feeCategoryId);
    }
  });

  // Helper to get or create entry
  const getEntry = (sku: string) => {
    if (!sku) return null;
    const normalizedSku = String(sku).trim();
    if (!productMap.has(normalizedSku)) {
      productMap.set(normalizedSku, { sku: normalizedSku });
    }
    return productMap.get(normalizedSku)!;
  };

  // 1. Process Info File
  info.forEach(item => {
    const entry = getEntry(item.sku);
    if (entry) {
      entry.name = item.name || 'Không tên';
      entry.costPrice = Number(item.costPrice) || 0;
    }
  });

  // 2. Process Inventory File
  inventory.forEach(item => {
    const entry = getEntry(item.sku);
    if (entry) {
      entry.stockHN = Number(item.stockHN) || 0;
      entry.stockHCM = Number(item.stockHCM) || 0;
      entry.sales30d = Number(item.sales30d) || 0;
    }
  });

  // 3. Process Pricing File
  pricing.forEach(item => {
    const entry = getEntry(item.sku);
    if (entry) {
      entry.priceWeb = Number(item.priceWeb) || 0;
      entry.priceShopee = Number(item.priceShopee) || 0;
    }
  });

  // Get current fee table
  const feeTable = getFeeCategories(config.shopType);
  const defaultCategory = feeTable[feeTable.length - 1]; // Usually "Others/Default"

  // 4. Calculate Derived Fields & Finalize
  const results: ProductData[] = [];

  productMap.forEach((entry) => {
    // Defaults
    const p = entry as ProductData;
    p.name = p.name || 'N/A';
    p.costPrice = p.costPrice || 0;
    p.stockHN = p.stockHN || 0;
    p.stockHCM = p.stockHCM || 0;
    p.sales30d = p.sales30d || 0;
    p.priceWeb = p.priceWeb || 0;
    p.priceShopee = p.priceShopee || 0;

    // Determine Fee Category
    // If user previously selected a category for this SKU, keep it (check if ID exists in current table)
    // Since we standardized IDs (it_laptop, it_component), this switching works seamlessly.
    const preservedId = existingCategoryMap.get(p.sku);
    const foundPreserved = preservedId ? feeTable.find(c => c.id === preservedId) : undefined;
    
    const selectedCategory = foundPreserved || defaultCategory;
    p.feeCategoryId = selectedCategory.id;
    p.feeRate = selectedCategory.rate;

    // Calculations
    p.platformFee = calculateFee(p.priceShopee, p.feeRate, config.useVoucherExtra);
    
    // Lãi lỗ = Giá bán Shopee - Giá vốn - Chi phí sàn
    p.profit = p.priceShopee - p.costPrice - p.platformFee;

    results.push(p);
  });

  return results;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};