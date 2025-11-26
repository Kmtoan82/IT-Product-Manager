import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutDashboard, ArrowUpDown, AlertCircle, Search, Store, Receipt, Download, Layers, Filter, Box, Save, Info, X } from 'lucide-react';
import { RawProductInfo, RawInventory, RawPricing, ProductData, AppConfig, ShopType, FeeCategory } from './types';
import { mergeData, formatCurrency } from './services/dataService';
import { getFeeCategories } from './services/feeTables';
import FileUpload from './components/FileUpload';
import AnalysisPanel from './components/AnalysisPanel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// --- Sub-components ---

// 1. Editable Cell Component (Quick Edit with Save)
interface EditableCellProps {
  value: number;
  onSave: (newValue: number) => void;
  type?: 'currency' | 'number';
  className?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type = 'currency', className = '' }) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  const [isDirty, setIsDirty] = useState(false);

  // Update local state if prop changes (and we aren't editing)
  useEffect(() => {
    if (!isDirty) {
      setLocalValue(value.toString());
    }
  }, [value, isDirty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    const num = Number(localValue);
    if (!isNaN(num)) {
      onSave(num);
      setIsDirty(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className={`relative flex items-center group/edit ${className}`}>
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 transition-all ${
          isDirty ? 'border-blue-400 ring-1 ring-blue-200 bg-blue-50 pr-8' : 'border-transparent bg-transparent hover:border-gray-300 hover:bg-white'
        } ${type === 'currency' ? 'text-right' : 'text-center'}`}
      />
      {isDirty && (
        <button
          onClick={handleSave}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1 rounded z-10 bg-white shadow-sm"
          title="Lưu thay đổi"
        >
          <Save size={14} />
        </button>
      )}
    </div>
  );
};

// 2. Price Detail Popover Component
const PriceDetailPopover: React.FC<{ web: number, dist: number, shopee: number, onClose: () => void }> = ({ web, dist, shopee, onClose }) => {
  return (
    <div className="absolute z-50 top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-4 animate-in fade-in zoom-in duration-200">
      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
        <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider">So sánh giá</h4>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">1. Giá Web (Lẻ):</span>
          <span className="font-medium text-gray-800">{formatCurrency(web)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">2. Giá Phân Phối (Vốn):</span>
          <span className="font-medium text-gray-800">{formatCurrency(dist)}</span>
        </div>
        <div className="flex justify-between items-center bg-blue-50 p-2 rounded border border-blue-100">
          <span className="text-blue-700 font-bold">3. Giá Sàn TMĐT:</span>
          <span className="font-bold text-blue-700">{formatCurrency(shopee)}</span>
        </div>
      </div>
      <div className="absolute -top-2 left-4 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
    </div>
  );
};

// 3. Product Row Component (Optimized)
interface ProductRowProps {
  row: ProductData;
  feeCategories: FeeCategory[];
  config: AppConfig;
  isGroupMode: boolean;
  onCategoryChange: (sku: string, id: string) => void;
  onUpdateField: (sku: string, field: keyof ProductData, value: number) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ row, feeCategories, config, isGroupMode, onCategoryChange, onUpdateField }) => {
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPriceDetails(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-slate-50 transition-colors group border-b border-gray-50 last:border-none">
      {/* SKU */}
      <td className="px-4 py-3 font-medium text-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {row.sku}
          {isGroupMode && (row as any).variantCount > 1 && (
            <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center">
              <Box size={10} className="mr-1" /> +{(row as any).variantCount - 1}
            </span>
          )}
        </div>
      </td>

      {/* Name */}
      <td className="px-4 py-3 text-slate-600 max-w-xs truncate text-xs" title={row.name}>{row.name}</td>

      {/* Category Selector */}
      <td className="px-4 py-3 min-w-[180px]">
        {isGroupMode ? (
          <span className="text-gray-400 italic text-xs">Tắt gộp để sửa</span>
        ) : (
          <select
            className="w-full text-xs border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50"
            value={row.feeCategoryId}
            onChange={(e) => onCategoryChange(row.sku, e.target.value)}
          >
            {feeCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.rate}%)
              </option>
            ))}
          </select>
        )}
      </td>

      {/* Cost Price (Giá Vốn) */}
      <td className="px-4 py-3 w-32">
        {isGroupMode ? (
          <span className="text-slate-600 italic text-xs block text-right">~{formatCurrency(row.costPrice)}</span>
        ) : (
          <EditableCell 
            value={row.costPrice} 
            onSave={(val) => onUpdateField(row.sku, 'costPrice', val)} 
          />
        )}
      </td>

      {/* Selling Price (Giá Bán TMĐT) + Detail Popover */}
      <td className="px-4 py-3 w-44">
        {isGroupMode ? (
          <span className="text-slate-600 italic text-xs block text-right">~{formatCurrency(row.priceShopee)}</span>
        ) : (
          <div className="flex items-center gap-1 relative" ref={popoverRef}>
            <div className="flex-1">
                <EditableCell 
                    value={row.priceShopee} 
                    onSave={(val) => onUpdateField(row.sku, 'priceShopee', val)} 
                />
            </div>
            <button 
                onClick={() => setShowPriceDetails(!showPriceDetails)}
                className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${showPriceDetails ? 'bg-blue-100 text-blue-600' : 'text-gray-300 hover:bg-gray-100 hover:text-blue-500'}`}
                title="Xem chi tiết giá (Web/Phân phối)"
            >
                <Info size={14} />
            </button>
            
            {/* Detail Popover */}
            {showPriceDetails && (
                <PriceDetailPopover 
                    web={row.priceWeb}
                    dist={row.costPrice}
                    shopee={row.priceShopee}
                    onClose={() => setShowPriceDetails(false)}
                />
            )}
          </div>
        )}
      </td>

      {/* Platform Fee */}
      <td className="px-4 py-3 text-slate-500 italic text-xs text-right" title={`Rate: ${row.feeRate}%`}>
        {formatCurrency(row.platformFee)}
      </td>

      {/* Profit */}
      <td className={`px-4 py-3 font-bold text-xs text-right ${row.profit <= 0 ? 'text-red-600 bg-red-50' : 'text-green-600'}`}>
        {formatCurrency(row.profit)}
      </td>

      {/* Stock HN */}
      <td className={`px-4 py-3 w-20 text-center ${row.stockHN < config.lowStockThreshold ? 'bg-amber-50' : ''}`}>
        {isGroupMode ? (
            <span className="font-medium text-xs">{row.stockHN}</span>
        ) : (
            <EditableCell 
                value={row.stockHN} 
                onSave={(val) => onUpdateField(row.sku, 'stockHN', val)} 
                type="number"
                className={row.stockHN < config.lowStockThreshold ? 'text-amber-700 font-bold' : ''}
            />
        )}
      </td>

      {/* Stock HCM */}
      <td className={`px-4 py-3 w-20 text-center ${row.stockHCM < config.lowStockThreshold ? 'bg-amber-50' : ''}`}>
        {isGroupMode ? (
            <span className="font-medium text-xs">{row.stockHCM}</span>
        ) : (
            <EditableCell 
                value={row.stockHCM} 
                onSave={(val) => onUpdateField(row.sku, 'stockHCM', val)} 
                type="number"
                className={row.stockHCM < config.lowStockThreshold ? 'text-amber-700 font-bold' : ''}
            />
        )}
      </td>

      {/* Sales 30d */}
      <td className="px-4 py-3 text-blue-600 font-medium text-xs text-center">
        {row.sales30d}
      </td>
    </tr>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  // --- State ---
  const [infoData, setInfoData] = useState<RawProductInfo[]>([]);
  const [invData, setInvData] = useState<RawInventory[]>([]);
  const [priceData, setPriceData] = useState<RawPricing[]>([]);
  
  const [mergedData, setMergedData] = useState<ProductData[]>([]);
  
  // Initialize config from localStorage if available
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('IT_PM_APP_CONFIG');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error("Failed to parse saved config:", e);
      }
    }
    return {
      shopType: 'SHOPEE_NORMAL',
      useVoucherExtra: true,
      lowStockThreshold: 10
    };
  });

  const [sortField, setSortField] = useState<keyof ProductData>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [groupVariants, setGroupVariants] = useState<boolean>(false);

  // --- Effects ---

  useEffect(() => {
    localStorage.setItem('IT_PM_APP_CONFIG', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (infoData.length > 0 || invData.length > 0 || priceData.length > 0) {
      const merged = mergeData(infoData, invData, priceData, config, mergedData);
      setMergedData(merged);
    }
  }, [infoData, invData, priceData, config.shopType, config.useVoucherExtra, config.lowStockThreshold]);

  // --- Handlers ---
  const handleSort = (field: keyof ProductData) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleCategoryChange = (sku: string, categoryId: string) => {
    const feeCategories = getFeeCategories(config.shopType);
    const category = feeCategories.find(c => c.id === categoryId);
    if (!category) return;

    const updatedData = mergedData.map(p => {
      if (p.sku === sku) {
        const paymentFee = p.priceShopee * 0.0491;
        const fixedFee = p.priceShopee * (category.rate / 100);
        const serviceFee = config.useVoucherExtra ? Math.min(p.priceShopee * 0.025, 50000) : 0;
        const infraFee = 4620;
        const platformFee = paymentFee + fixedFee + serviceFee + infraFee;
        
        return {
          ...p,
          feeCategoryId: categoryId,
          feeRate: category.rate,
          platformFee,
          profit: p.priceShopee - p.costPrice - platformFee
        };
      }
      return p;
    });
    setMergedData(updatedData);
  };

  // Unified Update Handler
  const handleUpdateProductField = (sku: string, field: keyof ProductData, value: number) => {
    // 1. Update Source Data (so it persists on re-merge)
    if (field === 'costPrice') {
        setInfoData(prev => {
            const idx = prev.findIndex(i => i.sku === sku);
            if (idx >= 0) {
                const clone = [...prev];
                clone[idx] = { ...clone[idx], costPrice: value };
                return clone;
            }
            return [...prev, { sku, name: '', costPrice: value }];
        });
    } else if (field === 'priceShopee') {
        setPriceData(prev => {
            const idx = prev.findIndex(i => i.sku === sku);
            if (idx >= 0) {
                const clone = [...prev];
                clone[idx] = { ...clone[idx], priceShopee: value };
                return clone;
            }
            return [...prev, { sku, priceWeb: 0, priceShopee: value }];
        });
    } else if (field === 'stockHN' || field === 'stockHCM') {
        setInvData(prev => {
            const idx = prev.findIndex(i => i.sku === sku);
            if (idx >= 0) {
                const clone = [...prev];
                clone[idx] = { ...clone[idx], [field]: value };
                return clone;
            }
            return [...prev, { sku, stockHN: 0, stockHCM: 0, sales30d: 0, [field]: value }];
        });
    }
  };

  const handleExportCSV = () => {
    if (mergedData.length === 0) return;

    const headers = [
      'SKU',
      'Tên Hàng Hóa',
      'Ngành Hàng',
      'Phí Cố Định (%)',
      'Giá Vốn',
      'Giá Bán',
      'Phí Sàn',
      'Lãi Lỗ',
      'Kho HN',
      'Kho HCM',
      'Bán 30d'
    ];

    const currentFeeCategories = getFeeCategories(config.shopType);
    const csvRows = mergedData.map(row => {
      const categoryName = currentFeeCategories.find(c => c.id === row.feeCategoryId)?.name || 'N/A';
      return [
        `"${row.sku}"`,
        `"${row.name.replace(/"/g, '""')}"`, // Escape quotes
        `"${categoryName}"`,
        row.feeRate,
        row.costPrice,
        row.priceShopee,
        row.platformFee,
        row.profit,
        row.stockHN,
        row.stockHCM,
        row.sales30d
      ].join(',');
    });

    // Add BOM for Excel UTF-8 support
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bao_cao_${config.shopType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processedData = useMemo(() => {
    let data = [...mergedData];

    // 1. Filter Text
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      data = data.filter(p => 
        p.sku.toLowerCase().includes(lowerFilter) || 
        p.name.toLowerCase().includes(lowerFilter)
      );
    }

    // 2. Filter Category
    if (categoryFilter !== 'all') {
      data = data.filter(p => p.feeCategoryId === categoryFilter);
    }

    // 3. Group Variants
    if (groupVariants) {
      const groupedMap = new Map<string, ProductData & { variantCount: number }>();
      
      data.forEach(item => {
        // Determine base SKU (e.g. LOGI_G102_BLK -> LOGI_G102)
        const separatorIndex = item.sku.lastIndexOf('_') > -1 ? item.sku.lastIndexOf('_') : item.sku.lastIndexOf('-');
        const baseSku = separatorIndex > 0 ? item.sku.substring(0, separatorIndex) : item.sku;
        
        if (!groupedMap.has(baseSku)) {
          groupedMap.set(baseSku, { ...item, sku: baseSku, variantCount: 1 });
        } else {
          const existing = groupedMap.get(baseSku)!;
          // Aggregate
          existing.stockHN += item.stockHN;
          existing.stockHCM += item.stockHCM;
          existing.sales30d += item.sales30d;
          existing.costPrice = (existing.costPrice + item.costPrice) / 2; 
          existing.priceShopee = (existing.priceShopee + item.priceShopee) / 2;
          existing.platformFee = (existing.platformFee + item.platformFee) / 2;
          existing.profit = (existing.profit + item.profit);
          existing.variantCount += 1;
        }
      });
      
      data = Array.from(groupedMap.values());
    }

    // 4. Sort
    data.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc' 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return data;
  }, [mergedData, sortField, sortOrder, filterText, categoryFilter, groupVariants]);

  // --- Stats ---
  const stats = useMemo(() => {
    const totalItems = mergedData.length;
    const lossMaking = mergedData.filter(p => p.profit <= 0).length;
    const lowStock = mergedData.filter(p => p.stockHN < config.lowStockThreshold || p.stockHCM < config.lowStockThreshold).length;
    return { totalItems, lossMaking, lowStock };
  }, [mergedData, config.lowStockThreshold]);

  // --- Chart Data ---
  const chartData = useMemo(() => {
    const sorted = [...mergedData].sort((a, b) => b.profit - a.profit);
    const top5 = sorted.slice(0, 5);
    const bottom5 = sorted.slice(-5).reverse();
    return [...top5, ...bottom5].map(p => ({
      name: p.sku,
      profit: p.profit,
      sales: p.sales30d
    }));
  }, [mergedData]);

  const currentFeeCategories = useMemo(() => getFeeCategories(config.shopType), [config.shopType]);
  const shopTabs: { id: ShopType, label: string, icon: React.ReactNode, color: string }[] = [
    { id: 'SHOPEE_NORMAL', label: 'Shopee Thường', icon: <Store size={16} />, color: 'orange' },
    { id: 'SHOPEE_MALL', label: 'Shopee Mall', icon: <Store size={16} />, color: 'red' },
    { id: 'TIKTOK_SHOP', label: 'TikTok Shop', icon: <Store size={16} />, color: 'black' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">IT Product Manager</h1>
              <p className="text-xs text-slate-500">Hệ thống nhập liệu & Tối ưu lợi nhuận</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors select-none ${config.useVoucherExtra ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
              onClick={() => setConfig({...config, useVoucherExtra: !config.useVoucherExtra})}
            >
              <Receipt size={16} />
              <span className="font-medium">Voucher Extra (2.5%)</span>
              <div className={`w-3 h-3 rounded-full border ${config.useVoucherExtra ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}`}></div>
            </div>

             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-sm">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-slate-600 font-medium hidden sm:inline">Ngưỡng Tồn:</span>
              <input 
                type="number" 
                value={config.lowStockThreshold}
                onChange={(e) => setConfig({...config, lowStockThreshold: Number(e.target.value)})}
                className="w-12 bg-transparent border-b border-slate-300 text-center font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Input Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
            Nhập Dữ Liệu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUpload 
              label="File 1: Thông tin cơ bản" 
              description="Chứa SKU, Tên hàng, Giá vốn"
              accept=".csv"
              requiredFields={['sku', 'name', 'costPrice']}
              onDataLoaded={(data) => setInfoData(data)}
            />
            <FileUpload 
              label="File 2: Kho & Bán hàng" 
              description="Chứa SKU, Tồn HN/HCM, SL bán"
              accept=".csv"
              requiredFields={['sku', 'stockHN', 'stockHCM', 'sales30d']}
              onDataLoaded={(data) => setInvData(data)}
            />
            <FileUpload 
              label="File 3: Giá bán" 
              description="Chứa SKU, Giá Web, Giá Shopee"
              accept=".csv"
              requiredFields={['sku', 'priceWeb', 'priceShopee']}
              onDataLoaded={(data) => setPriceData(data)}
            />
          </div>
        </section>

        {mergedData.length > 0 && (
          <>
            {/* Dashboard Stats & Charts */}
            <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow border border-slate-100">
                  <p className="text-sm text-slate-500">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-slate-100 border-l-4 border-l-red-500">
                  <p className="text-sm text-slate-500">Sản phẩm Lỗ vốn</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lossMaking}</p>
                  <p className="text-xs text-slate-400 mt-1">Cần điều chỉnh giá ngay</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-slate-100 border-l-4 border-l-amber-500">
                  <p className="text-sm text-slate-500">Cảnh báo tồn kho</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
                  <p className="text-xs text-slate-400 mt-1">Dưới {config.lowStockThreshold} sản phẩm</p>
                </div>
              </div>

              {/* Chart */}
              <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow border border-slate-100">
                 <h3 className="text-sm font-semibold text-slate-600 mb-4">Top Lợi Nhuận (Cao nhất & Thấp nhất)</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" />
                        <YAxis tickFormatter={(val) => `${val/1000}k`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <ReferenceLine y={0} stroke="#000" />
                        <Bar dataKey="profit" fill="#3b82f6" name="Lãi/Lỗ" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </section>

             {/* AI Analysis */}
            <AnalysisPanel products={mergedData} config={config} />

            {/* Data Table */}
            <section className="mt-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                Bảng Dữ Liệu Tổng Hợp
              </h2>

              {/* Shop Type Tabs */}
              <div className="flex space-x-1 bg-slate-200 p-1 rounded-t-lg w-fit mb-0">
                {shopTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setConfig({ ...config, shopType: tab.id })}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      config.shopType === tab.id
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Toolbar */}
              <div className="bg-white p-4 border-x border-t border-gray-200 flex flex-col md:flex-row justify-between gap-4 items-center rounded-tr-lg">
                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Filter size={16} className="text-gray-500" />
                    <select 
                      className="bg-transparent text-sm text-gray-700 focus:outline-none border-none p-0"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Tất cả ngành hàng</option>
                      {currentFeeCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Variants Toggle */}
                  <button
                    onClick={() => setGroupVariants(!groupVariants)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      groupVariants 
                        ? 'bg-purple-50 border-purple-200 text-purple-700' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Layers size={16} />
                    Gộp biến thể {groupVariants && '(Đang bật)'}
                  </button>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                   <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Tìm SKU hoặc Tên..." 
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleExportCSV}
                    disabled={mergedData.length === 0}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Download size={16} />
                    Xuất Excel
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-b-lg shadow overflow-hidden border border-gray-200 border-t-0">
                <div className="overflow-x-auto pb-20">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Tên Hàng Hóa</th>
                        <th className="px-4 py-3">Ngành Hàng (Phí Cố Định)</th>
                        <th className="px-4 py-3">Giá Vốn</th>
                        <th className="px-4 py-3">Giá Bán (Sàn)</th>
                        <th className="px-4 py-3 text-right">Phí Sàn</th>
                        <th 
                          className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('profit')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Lãi Lỗ {groupVariants && '(Tổng)'}
                            {sortField === 'profit' && <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center">Kho HN</th>
                        <th className="px-4 py-3 text-center">Kho HCM</th>
                        <th 
                          className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100"
                          onClick={() => handleSort('sales30d')}
                        >
                          Bán 30d
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {processedData.map((row) => (
                        <ProductRow 
                            key={row.sku} 
                            row={row} 
                            feeCategories={currentFeeCategories} 
                            config={config}
                            isGroupMode={groupVariants}
                            onCategoryChange={handleCategoryChange}
                            onUpdateField={handleUpdateProductField}
                        />
                      ))}
                      {processedData.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                            Không tìm thấy dữ liệu phù hợp
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-slate-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500 flex flex-col md:flex-row justify-between gap-2">
                  <span>Hiển thị {processedData.length} dòng</span>
                  <div className="flex gap-4">
                    <span>Phí Thanh Toán: 4.91%</span>
                    <span>Voucher Extra: {config.useVoucherExtra ? '2.5% (Max 50k)' : 'Tắt'}</span>
                    <span>Phí Hạ Tầng: 4,620đ</span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default App;