import { FeeCategory } from '../types';

// --- STANDARDIZED IT CATEGORIES ---
// IDs are consistent across shops to allow seamless switching without re-selecting categories.

// 1. Shopee Mall Fees (Based on provided PDF)
export const SHOPEE_MALL_IT_FEES: FeeCategory[] = [
  { id: 'it_laptop', name: 'Máy tính & Laptop - Laptop', rate: 1.82 },
  { id: 'it_desktop', name: 'Máy tính & Laptop - Máy tính bàn / All-in-one', rate: 1.82 },
  { id: 'it_monitor', name: 'Máy tính & Laptop - Màn hình', rate: 1.82 },
  { id: 'it_server', name: 'Máy tính & Laptop - Máy chủ & Tủ mạng', rate: 1.82 },
  { id: 'it_component', name: 'Linh kiện (CPU, RAM, VGA, Mainboard, Case, Nguồn)', rate: 6.05 },
  { id: 'it_storage', name: 'Lưu trữ (HDD, SSD, USB, Thẻ nhớ)', rate: 6.05 },
  { id: 'it_network', name: 'Thiết bị mạng (Wifi, Router, Switch)', rate: 6.05 },
  { id: 'it_printer', name: 'Máy in, Máy Scan & Thiết bị văn phòng', rate: 6.05 },
  { id: 'it_accessory', name: 'Phụ kiện (Chuột, Phím, Cáp, Hub, Túi)', rate: 6.05 },
  { id: 'it_software', name: 'Phần mềm', rate: 6.05 },
  { id: 'it_camera', name: 'Camera & Flycam', rate: 5.50 },
  { id: 'it_audio', name: 'Thiết bị Âm thanh (Loa, Tai nghe)', rate: 6.05 },
  { id: 'it_console', name: 'Game Console & Phụ kiện', rate: 6.05 },
  { id: 'it_default', name: 'Khác (Mặc định Mall)', rate: 6.05 },
];

// 2. Shopee Normal Fees (Based on provided PDF)
export const SHOPEE_NORMAL_IT_FEES: FeeCategory[] = [
  { id: 'it_laptop', name: 'Máy tính & Laptop - Laptop', rate: 1.50 },
  { id: 'it_desktop', name: 'Máy tính & Laptop - Máy tính bàn', rate: 1.50 },
  { id: 'it_monitor', name: 'Máy tính & Laptop - Màn hình', rate: 1.50 },
  { id: 'it_server', name: 'Máy tính & Laptop - Máy chủ & Tủ mạng', rate: 7.00 }, // Nhóm thiết bị mạng
  { id: 'it_component', name: 'Linh kiện (CPU, RAM, VGA, Mainboard...)', rate: 7.00 },
  { id: 'it_storage', name: 'Lưu trữ (HDD, SSD, USB, Thẻ nhớ)', rate: 7.00 },
  { id: 'it_network', name: 'Thiết bị mạng (Wifi, Router, Switch)', rate: 7.00 },
  { id: 'it_printer', name: 'Máy in, Máy Scan & Thiết bị văn phòng', rate: 8.00 }, // TB Văn phòng
  { id: 'it_accessory', name: 'Phụ kiện (Chuột, Phím, Cáp...)', rate: 8.00 }, // Chuột bàn phím 8%
  { id: 'it_software', name: 'Phần mềm', rate: 8.00 },
  { id: 'it_camera', name: 'Camera & Flycam', rate: 7.00 },
  { id: 'it_audio', name: 'Thiết bị Âm thanh', rate: 8.00 },
  { id: 'it_console', name: 'Game Console & Phụ kiện', rate: 8.00 }, // Nhóm khác/chung
  { id: 'it_default', name: 'Khác (Mặc định Thường)', rate: 8.00 },
];

// 3. TikTok Shop Fees (Based on provided PDF, using User's Formula logic)
export const TIKTOK_IT_FEES: FeeCategory[] = [
  { id: 'it_laptop', name: 'Máy tính & Laptop - Laptop', rate: 3.30 },
  { id: 'it_desktop', name: 'Máy tính & Laptop - Máy tính bàn', rate: 3.30 },
  { id: 'it_monitor', name: 'Máy tính & Laptop - Màn hình', rate: 7.80 },
  { id: 'it_server', name: 'Máy tính & Laptop - Máy chủ', rate: 3.30 },
  { id: 'it_component', name: 'Linh kiện (VGA, Main...) - Mức TB', rate: 12.60 }, // Averaged safe rate
  { id: 'it_storage', name: 'Lưu trữ (HDD, SSD, USB)', rate: 12.60 },
  { id: 'it_network', name: 'Thiết bị mạng', rate: 12.60 },
  { id: 'it_printer', name: 'Máy in & Máy Scan', rate: 10.50 }, // Máy in 3D is 10.50, general printers 8.50, picking safe high
  { id: 'it_accessory', name: 'Phụ kiện (Chuột, Phím)', rate: 12.60 },
  { id: 'it_software', name: 'Phần mềm', rate: 12.60 },
  { id: 'it_camera', name: 'Camera & Flycam', rate: 7.80 }, // Máy ảnh KTS
  { id: 'it_audio', name: 'Thiết bị Âm thanh', rate: 12.60 },
  { id: 'it_console', name: 'Game Console', rate: 12.60 },
  { id: 'it_default', name: 'Khác (Mặc định TikTok)', rate: 12.60 },
];

export const getFeeCategories = (type: string): FeeCategory[] => {
  switch (type) {
    case 'SHOPEE_MALL': return SHOPEE_MALL_IT_FEES;
    case 'TIKTOK_SHOP': return TIKTOK_IT_FEES;
    case 'SHOPEE_NORMAL': 
    default:
      return SHOPEE_NORMAL_IT_FEES;
  }
};