export interface RawProductInfo {
  sku: string;
  name: string;
  costPrice: number; // Giá phân phối (vốn)
}

export interface RawInventory {
  sku: string;
  stockHN: number;
  stockHCM: number;
  sales30d: number;
}

export interface RawPricing {
  sku: string;
  priceWeb: number;
  priceShopee: number;
}

export type ShopType = 'SHOPEE_NORMAL' | 'SHOPEE_MALL' | 'TIKTOK_SHOP';

export interface FeeCategory {
  id: string;
  name: string;
  rate: number; // Percentage
}

export interface ProductData {
  sku: string;
  name: string;
  costPrice: number;
  stockHN: number;
  stockHCM: number;
  sales30d: number;
  priceWeb: number;
  priceShopee: number;
  
  // Fee config per product
  feeCategoryId?: string; // ID from the Fee Table
  feeRate?: number; // The actual rate applied

  // Derived fields
  platformFee: number; // Chi phí sàn
  profit: number; // Lãi lỗ
}

export enum FileType {
  INFO = 'INFO',
  INVENTORY = 'INVENTORY',
  PRICING = 'PRICING'
}

export interface AppConfig {
  shopType: ShopType;
  useVoucherExtra: boolean; // Toggle for the 2.5% service fee
  lowStockThreshold: number;
}