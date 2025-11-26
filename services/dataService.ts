import Papa from 'papaparse';
import { ProductData, RawInventory, RawPricing, RawProductInfo, AppConfig, ShopType, FeeCategory } from '../types';

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
const PAYMENT_FEE_PERCENT = 4.91; // Updated as per context usually around 4-5%
const SERVICE_FEE_PERCENT = 2.5;
const SERVICE_FEE_CAP = 50000; // Max cap for some fees usually applies
const FIXED_INFRA_FEE = 3000 + 1620; // 4,620 VND

// Export breakdown for UI display
export const calculateFeeBreakdown = (price: number, fixedRatePercent: number, useVoucherExtra: boolean) => {
  if (price <= 0) {
    return { payment: 0, fixed: 0, service: 0, infra: 0, total: 0 };
  }

  // 1. Payment Fee (Phí thanh toán)
  const payment = price * (PAYMENT_FEE_PERCENT / 100);

  // 2. Fixed Fee (Phí cố định)
  const fixed = price * (fixedRatePercent / 100);

  // 3. Service Fee (Phí dịch vụ - Voucher Extra)
  let service = 0;
  if (useVoucherExtra) {
    const rawService = price * (SERVICE_FEE_PERCENT / 100);
    // Note: Depending on platform policies, service fee might have a cap. 
    // Using logic from previous code block.
    service = Math.min(rawService, SERVICE_FEE_CAP); 
  }

  // 4. Infrastructure Fee (Phí hạ tầng/cố định nhỏ)
  const infra = FIXED_INFRA_FEE;

  return {
    payment,
    fixed,
    service,
    infra,
    total: payment + fixed + service + infra
  };
};

const calculateFee = (price: number, fixedRatePercent: number, useVoucherExtra: boolean): number => {
  return calculateFeeBreakdown(price, fixedRatePercent, useVoucherExtra).total;
};

// Merging Logic
export const mergeData = (
  info: RawProductInfo[],
  inventory: RawInventory[],
  pricing: RawPricing[],
  config: AppConfig,
  activeFeeTable: FeeCategory[], // RECEIVE current dynamic fee table
  existingData: ProductData[] = [], 
  customRates: Record<string, number> = {} 
): ProductData[] => {
  const productMap = new Map<string, Partial<ProductData>>();

  // Load existing choices
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

  // 1. Process Info
  info.forEach(item => {
    const entry = getEntry(item.sku);
    if (entry) {
      entry.name = item.name || 'Không tên';
      entry.costPrice = Number(item.costPrice) || 0;
    }
  });

  // 2. Process Inventory
  inventory.forEach(item => {
    const entry = getEntry(item.sku);
    if (entry) {
      entry.stockHN = Number(item.stockHN) || 0;
      entry.stockHCM = Number(item.stockHCM) || 0;
      entry.sales30d = Number(item.sales30d) || 0;
    }
  });

  // 3. Process Pricing
  pricing.forEach(item => {
    const entry = getEntry(item.sku);
    if (entry) {
      entry.priceWeb = Number(item.priceWeb) || 0;
      entry.priceShopee = Number(item.priceShopee) || 0;
    }
  });

  // Use the passed active fee table
  const defaultCategory = activeFeeTable[activeFeeTable.length - 1]; 

  // 4. Calculate Derived Fields & Finalize
  const results: ProductData[] = [];

  productMap.forEach((entry) => {
    const p = entry as ProductData;
    p.name = p.name || 'N/A';
    p.costPrice = p.costPrice || 0;
    p.stockHN = p.stockHN || 0;
    p.stockHCM = p.stockHCM || 0;
    p.sales30d = p.sales30d || 0;
    p.priceWeb = p.priceWeb || 0;
    p.priceShopee = p.priceShopee || 0;

    // Determine Fee Category
    const preservedId = existingCategoryMap.get(p.sku);
    // IMPORTANT: Find category in the ACTIVE table. If ID exists but not in table (shop switched), revert to default
    const foundPreserved = preservedId ? activeFeeTable.find(c => c.id === preservedId) : undefined;
    
    const selectedCategory = foundPreserved || defaultCategory;
    p.feeCategoryId = selectedCategory.id;

    // Determine Fee Rate: Check custom product overrides first, then category default
    const customRate = customRates[p.sku];
    p.feeRate = customRate !== undefined ? customRate : selectedCategory.rate;

    // Calculations
    p.platformFee = calculateFee(p.priceShopee, p.feeRate, config.useVoucherExtra);
    
    p.profit = p.priceShopee - p.costPrice - p.platformFee;

    results.push(p);
  });

  return results;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};