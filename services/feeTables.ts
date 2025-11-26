import { FeeCategory } from '../types';

// --- SHOPEE MALL IT FEES (Áp dụng 08/09/2025) ---
// Dựa trên tài liệu PDF chi tiết
export const SHOPEE_MALL_IT_FEES: FeeCategory[] = [
  // 3.30% Group - Máy tính & Server
  { id: 'mall_sys_laptop', name: 'Laptop / Máy tính xách tay', rate: 3.30 },
  { id: 'mall_sys_desktop', name: 'Máy Tính Bàn / All-in-one', rate: 3.30 },
  { id: 'mall_sys_server', name: 'Máy Chủ (Server)', rate: 3.30 },
  { id: 'mall_sys_mini', name: 'Máy Tính Mini', rate: 3.30 },

  // 6.40% Group - Máy ảnh cao cấp
  { id: 'mall_cam_dslr', name: 'Máy ảnh cơ / DSLR / Mirrorless', rate: 6.40 },

  // 7.80% Group - Vi xử lý & Màn hình & Camera số
  { id: 'mall_cpu', name: 'CPU - Bộ Vi Xử Lý', rate: 7.80 },
  { id: 'mall_monitor', name: 'Màn Hình', rate: 7.80 },
  { id: 'mall_cam_action', name: 'Máy quay hành động / KTS', rate: 7.80 },
  { id: 'mall_lens', name: 'Ống kính máy ảnh', rate: 7.80 },

  // 8.50% Group - Mainboard & Máy in
  { id: 'mall_mainboard', name: 'Mainboard - Bo Mạch Chủ', rate: 8.50 },
  { id: 'mall_printer_office', name: 'Máy In / Scan / Photo', rate: 8.50 },
  { id: 'mall_water_purifier', name: 'Máy lọc nước', rate: 8.50 },

  // 10.50% Group - Lưu trữ & Âm thanh cao cấp
  { id: 'mall_ssd', name: 'Ổ Cứng SSD', rate: 10.50 },
  { id: 'mall_hdd_ext', name: 'Ổ Cứng Di Động', rate: 10.50 },
  { id: 'mall_ups', name: 'Bộ Lưu Điện', rate: 10.50 },
  { id: 'mall_amp', name: 'Amply & Đầu chỉnh âm', rate: 10.50 },
  { id: 'mall_draw_tab', name: 'Bảng Vẽ Điện Tử', rate: 10.50 },
  { id: 'mall_print_3d', name: 'Máy In 3D / Mã vạch', rate: 10.50 },

  // 12.60% Group - Linh Kiện & Phụ Kiện (Đa số)
  { id: 'mall_ram', name: 'RAM Máy Tính', rate: 12.60 },
  { id: 'mall_vga', name: 'VGA - Card Màn Hình', rate: 12.60 },
  { id: 'mall_case_psu', name: 'Case / Nguồn Máy Tính', rate: 12.60 },
  { id: 'mall_cooling', name: 'Quạt & Tản Nhiệt', rate: 12.60 },
  { id: 'mall_mouse_kb', name: 'Chuột & Bàn Phím', rate: 12.60 },
  { id: 'mall_sound', name: 'Loa / Tai nghe / Micro', rate: 12.60 },
  { id: 'mall_network', name: 'Thiết Bị Mạng (Wifi/Router)', rate: 12.60 },
  { id: 'mall_usb_nas', name: 'USB / OTG / NAS', rate: 12.60 },
  { id: 'mall_odd', name: 'Ổ Đĩa Quang', rate: 12.60 },
  { id: 'mall_acc_cam', name: 'Phụ kiện Máy ảnh / Flycam', rate: 12.60 },
  { id: 'mall_software', name: 'Phần Mềm', rate: 12.60 },
  { id: 'mall_cable', name: 'Cáp & Đầu chuyển', rate: 12.60 },
  { id: 'mall_office_equip', name: 'Thiết Bị Văn Phòng Khác', rate: 12.60 },
  
  // Default
  { id: 'mall_default', name: 'Khác / Mặc định', rate: 12.60 },
];

// --- SHOPEE NORMAL FEES (Cấu hình theo ảnh) ---
export const SHOPEE_NORMAL_IT_FEES: FeeCategory[] = [
  // 1.50% Group
  { id: 'norm_monitor', name: 'Màn Hình', rate: 1.50 },
  { id: 'norm_desktop', name: 'Máy Tính Bàn', rate: 1.50 },
  { id: 'norm_laptop', name: 'Laptop', rate: 1.50 },

  // 7.00% Group
  { id: 'norm_comp_parts', name: 'Linh Kiện Máy Tính (Chung)', rate: 7.00 },
  { id: 'norm_comp_acc', name: 'Phụ Kiện Máy Tính', rate: 7.00 },
  { id: 'norm_printer', name: 'Máy In & Máy Scan', rate: 7.00 },
  { id: 'norm_storage', name: 'Thiết Bị Lưu Trữ', rate: 7.00 },
  { id: 'norm_network', name: 'Thiết Bị Mạng', rate: 7.00 },
  { id: 'norm_cable', name: 'Cáp & Đầu chuyển', rate: 7.00 },
  { id: 'norm_music', name: 'Máy nghe nhạc', rate: 7.00 },
  { id: 'norm_default', name: 'Khác', rate: 7.00 },

  // 8.00% Group
  { id: 'norm_mouse_kb', name: 'Chuột & Bàn Phím', rate: 8.00 },
  { id: 'norm_office', name: 'Thiết Bị Văn Phòng', rate: 8.00 },
  { id: 'norm_software', name: 'Phần Mềm', rate: 8.00 },
  { id: 'norm_headphone', name: 'Tai nghe / Loa / Micro', rate: 8.00 },
  { id: 'norm_amp', name: 'Amply & Dàn âm thanh', rate: 8.00 },
];

// --- TIKTOK SHOP FEES (Theo bảng biểu phí mới) ---
export const TIKTOK_IT_FEES: FeeCategory[] = [
  // 1.21% Group
  { id: 'tt_phone', name: 'Điện thoại & Máy tính bảng', rate: 1.21 },

  // 1.82% Group
  { id: 'tt_sys', name: 'Laptop / PC / Màn hình', rate: 1.82 },

  // 3.63% Group
  { id: 'tt_cam_pro', name: 'Máy ảnh DSLR/Mirrorless', rate: 3.63 },

  // 6.05% Group (Đa số linh kiện)
  { id: 'tt_components', name: 'Linh kiện (RAM/CPU/VGA/Main...)', rate: 6.05 },
  { id: 'tt_accessories', name: 'Phụ kiện (Chuột/Phím/Tai nghe...)', rate: 6.05 },
  { id: 'tt_network', name: 'Thiết bị mạng', rate: 6.05 },
  { id: 'tt_office', name: 'Thiết bị văn phòng', rate: 6.05 },
  { id: 'tt_camera_acc', name: 'Camera GS & Phụ kiện', rate: 6.05 },
  { id: 'tt_default', name: 'Khác / Mặc định', rate: 6.05 },
];

export const getInitialFeeCategories = (type: string): FeeCategory[] => {
  switch (type) {
    case 'SHOPEE_MALL': return SHOPEE_MALL_IT_FEES;
    case 'TIKTOK_SHOP': return TIKTOK_IT_FEES;
    case 'SHOPEE_NORMAL': 
    default:
      return SHOPEE_NORMAL_IT_FEES;
  }
};