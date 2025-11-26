import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, ArrowUpDown, AlertCircle, Search, Store, Receipt, Download, Layers, Filter, Box, Save, Plus, Pencil, TrendingUp, XCircle, AlertTriangle, Settings, ChevronDown, X, Info } from 'lucide-react';
import { RawProductInfo, RawInventory, RawPricing, ProductData, AppConfig, ShopType, FeeCategory } from './types';
import { mergeData, formatCurrency, calculateFeeBreakdown } from './services/dataService';
import { getInitialFeeCategories, SHOPEE_MALL_IT_FEES, SHOPEE_NORMAL_IT_FEES, TIKTOK_IT_FEES } from './services/feeTables';
import FileUpload from './components/FileUpload';
import ChatAnalysisPanel from './components/ChatAnalysisPanel';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';

// --- Sub-components ---

// 1. Fee Detail Modal (New)
interface FeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
  config: AppConfig;
}

const FeeDetailModal: React.FC<FeeDetailModalProps> = ({ isOpen, onClose, product, config }) => {
  if (!isOpen || !product) return null;

  const breakdown = calculateFeeBreakdown(product.priceShopee, product.feeRate || 0, config.useVoucherExtra);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="bg-slate-100 px-5 py-3 flex justify-between items-center border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Chi tiết Phí Sàn</h3>
            <p className="text-xs text-slate-500 font-mono">{product.sku}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-dashed border-slate-200">
            <span className="text-sm text-slate-600">Giá Bán (Tham chiếu)</span>
            <span className="font-bold text-slate-900">{formatCurrency(product.priceShopee)}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">1. Phí Thanh Toán (4.91%)</span>
              <span className="font-medium text-slate-800">{formatCurrency(breakdown.payment)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1">
                2. Phí Cố Định ({product.feeRate}%) 
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">Theo ngành hàng</span>
              </span>
              <span className="font-medium text-slate-800">{formatCurrency(breakdown.fixed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-1">
                3. Voucher Extra 
                {config.useVoucherExtra ? 
                  <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">Đang bật</span> : 
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">Đã tắt</span>
                }
              </span>
              <span className="font-medium text-slate-800">{formatCurrency(breakdown.service)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">4. Phí Hạ tầng/Khác</span>
              <span className="font-medium text-slate-800">{formatCurrency(breakdown.infra)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center bg-red-50 -mx-6 px-6 py-3 mt-2">
            <span className="font-bold text-red-700 uppercase text-sm">Tổng Chi Phí</span>
            <span className="font-bold text-red-700 text-lg">{formatCurrency(breakdown.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Fee Configuration Modal
interface FeeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopType: ShopType;
  feeCategories: FeeCategory[];
  onUpdateCategories: (shopType: ShopType, newCategories: FeeCategory[]) => void;
}

const FeeConfigModal: React.FC<FeeConfigModalProps> = ({ isOpen, onClose, shopType, feeCategories, onUpdateCategories }) => {
  const [localCategories, setLocalCategories] = useState<FeeCategory[]>([]);

  useEffect(() => {
    setLocalCategories(JSON.parse(JSON.stringify(feeCategories))); // Deep copy
  }, [feeCategories, isOpen]);

  if (!isOpen) return null;

  const handleRateChange = (id: string, newRate: number) => {
    setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, rate: newRate } : c));
  };

  const handleSave = () => {
    onUpdateCategories(shopType, localCategories);
    onClose();
  };

  const shopName = shopType === 'SHOPEE_MALL' ? 'Shopee Mall' : shopType === 'TIKTOK_SHOP' ? 'TikTok Shop' : 'Shopee Thường';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings size={18} />
            Cấu hình Biểu phí - {shopName}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2">
            <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p>Điều chỉnh mức phí cố định cho từng ngành hàng. Thay đổi ở đây sẽ áp dụng cho tất cả sản phẩm thuộc ngành hàng đó.</p>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-3 py-2 text-left">Tên Ngành hàng (Cấp 3)</th>
                <th className="px-3 py-2 text-right w-32">Phí (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {localCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 text-gray-800">{cat.name}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input 
                        type="number" 
                        step="0.01"
                        value={cat.rate}
                        onChange={(e) => handleRateChange(cat.id, parseFloat(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-gray-500">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">Đóng</button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2">
             <Save size={18} /> Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Product Modal
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ProductData> & { sku: string }) => void;
  initialData?: ProductData | null;
  feeCategories: FeeCategory[];
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData, feeCategories }) => {
  const [formData, setFormData] = useState<Partial<ProductData>>({
    sku: '', name: '', costPrice: 0, priceShopee: 0, priceWeb: 0, stockHN: 0, stockHCM: 0, feeCategoryId: feeCategories[0]?.id
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        sku: '', name: '', costPrice: 0, priceShopee: 0, priceWeb: 0, stockHN: 0, stockHCM: 0, feeCategoryId: feeCategories[0]?.id
      });
    }
  }, [initialData, isOpen, feeCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sku) {
      onSave(formData as ProductData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {initialData ? <Pencil size={18} /> : <Plus size={18} />}
            {initialData ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Mã SKU <span className="text-red-500">*</span></label>
              <input 
                required
                disabled={!!initialData}
                type="text" 
                value={formData.sku} 
                onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="VD: LOGI-G102"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Tên Hàng Hóa</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập tên sản phẩm..."
              />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Ngành hàng (Phí Cố Định)</label>
             <select 
                value={formData.feeCategoryId}
                onChange={e => setFormData({...formData, feeCategoryId: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
             >
               {feeCategories.map(cat => (
                 <option key={cat.id} value={cat.id}>{cat.name} ({cat.rate}%)</option>
               ))}
             </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
             <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Giá Vốn</label>
                <input 
                  type="number" 
                  value={formData.costPrice} 
                  onChange={e => setFormData({...formData, costPrice: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-right font-mono"
                />
             </div>
             <div className="space-y-1">
                <label className="text-sm font-medium text-gray-600">Giá Web</label>
                <input 
                  type="number" 
                  value={formData.priceWeb} 
                  onChange={e => setFormData({...formData, priceWeb: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-right font-mono"
                />
             </div>
             <div className="space-y-1">
                <label className="text-sm font-bold text-blue-700">Giá Bán (Sàn)</label>
                <input 
                  type="number" 
                  value={formData.priceShopee} 
                  onChange={e => setFormData({...formData, priceShopee: Number(e.target.value)})}
                  className="w-full border border-blue-300 bg-blue-50 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-right font-bold font-mono text-blue-700"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tồn kho HN</label>
                <input 
                  type="number" 
                  value={formData.stockHN} 
                  onChange={e => setFormData({...formData, stockHN: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-center"
                />
             </div>
             <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Tồn kho HCM</label>
                <input 
                  type="number" 
                  value={formData.stockHCM} 
                  onChange={e => setFormData({...formData, stockHCM: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none text-center"
                />
             </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Hủy bỏ</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2">
               <Save size={18} /> Lưu Sản Phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Editable Cell (Quick Edit)
interface EditableCellProps {
  value: number;
  onSave: (newValue: number) => void;
  type?: 'currency' | 'number' | 'percent';
  className?: string;
}

const EditableCell: React.FC<EditableCellProps> = ({ value, onSave, type = 'currency', className = '' }) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) setLocalValue(value.toString());
  }, [value, isDirty]);

  const handleSave = () => {
    const num = Number(localValue);
    if (!isNaN(num)) {
      onSave(num);
      setIsDirty(false);
    }
  };

  const displayValue = useMemo(() => {
      if (type === 'currency') return formatCurrency(value);
      if (type === 'percent') return `${value}%`;
      return value;
  }, [value, type]);

  return (
    <div className={`relative flex items-center group/edit ${className}`}>
      <input
        type="text" 
        value={isDirty ? localValue : displayValue} 
        onChange={(e) => { setLocalValue(e.target.value); setIsDirty(true); }}
        onFocus={() => { setLocalValue(value.toString()); setIsDirty(true); }}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className={`w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 transition-all ${
          isDirty ? 'border-blue-400 ring-1 ring-blue-200 bg-blue-50 pr-8 text-gray-900' : 'border-transparent bg-transparent hover:border-gray-300 hover:bg-white text-inherit'
        } ${type === 'currency' ? 'text-right' : 'text-center'}`}
      />
      {isDirty && (
        <button onMouseDown={handleSave} className="absolute right-1 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800 p-1 rounded z-10 bg-white shadow-sm">
          <Save size={14} />
        </button>
      )}
    </div>
  );
};

// 5. Category Cell (Dropdown)
interface CategoryCellProps {
  categoryId: string | undefined;
  categories: FeeCategory[];
  onChange: (newId: string) => void;
}

const CategoryCell: React.FC<CategoryCellProps> = ({ categoryId, categories, onChange }) => {
  const current = categories.find(c => c.id === categoryId) || categories[categories.length - 1];
  
  return (
    <div className="relative group w-full">
      <select 
        value={categoryId} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-transparent border border-transparent hover:border-gray-300 hover:bg-white rounded px-2 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none cursor-pointer truncate pr-6"
      >
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name} ({cat.rate}%)
          </option>
        ))}
      </select>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600">
        <ChevronDown size={12} />
      </div>
    </div>
  );
};

// 6. Product Row
interface ProductRowProps {
  row: ProductData;
  config: AppConfig;
  feeCategories: FeeCategory[];
  isGroupMode: boolean;
  onUpdateField: (sku: string, field: keyof ProductData, value: number) => void;
  onUpdateCategory: (sku: string, newCategoryId: string) => void;
  onEditClick: (product: ProductData) => void;
  onShowFeeDetail: (product: ProductData) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ row, config, feeCategories, isGroupMode, onUpdateField, onUpdateCategory, onEditClick, onShowFeeDetail }) => {
  return (
    <tr className="hover:bg-slate-50 transition-colors group border-b border-gray-50 last:border-none">
      <td className="px-4 py-3 font-medium text-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {!isGroupMode && (
            <button onClick={() => onEditClick(row)} className="text-gray-300 hover:text-blue-600 transition-colors p-1"><Pencil size={12} /></button>
          )}
          <span className="font-mono">{row.sku}</span>
          {isGroupMode && (row as any).variantCount > 1 && (
            <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center">
              <Box size={10} className="mr-1" /> +{(row as any).variantCount - 1}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600 max-w-xs truncate text-xs" title={row.name}>{row.name}</td>
      
      {/* Category Dropdown & Fee Rate */}
      <td className="px-2 py-3 w-48">
         {isGroupMode ? (
            <div className="text-xs text-slate-500 text-center">{row.feeRate}%</div>
         ) : (
            <CategoryCell 
              categoryId={row.feeCategoryId}
              categories={feeCategories}
              onChange={(newId) => onUpdateCategory(row.sku, newId)}
            />
         )}
      </td>

      <td className="px-4 py-3 w-32 font-mono text-xs">
        {isGroupMode ? <span className="text-slate-600 italic block text-right">~{formatCurrency(row.costPrice)}</span> : 
          <EditableCell value={row.costPrice} onSave={(val) => onUpdateField(row.sku, 'costPrice', val)} />
        }
      </td>

      <td className="px-4 py-3 w-44">
        {isGroupMode ? <span className="text-blue-700 font-bold text-sm block text-right">~{formatCurrency(row.priceShopee)}</span> : 
          <div className="font-bold text-blue-700 text-sm font-mono">
             <EditableCell value={row.priceShopee} onSave={(val) => onUpdateField(row.sku, 'priceShopee', val)} type="currency" />
          </div>
        }
      </td>

      <td className="px-4 py-3 text-slate-500 italic text-xs text-right font-mono relative group/fee">
        <div className="flex items-center justify-end gap-1">
           <span>{formatCurrency(row.platformFee)}</span>
           <button onClick={() => onShowFeeDetail(row)} className="text-slate-300 hover:text-blue-600 transition-colors p-0.5 opacity-0 group-hover/fee:opacity-100" title="Xem chi tiết phí">
              <Info size={12} />
           </button>
        </div>
      </td>

      <td className={`px-4 py-3 font-bold text-xs text-right font-mono ${row.profit <= 0 ? 'text-red-600 bg-red-50' : 'text-green-600'}`}>
        {formatCurrency(row.profit)}
      </td>

      <td className={`px-4 py-3 w-20 text-center ${row.stockHN < config.lowStockThreshold ? 'bg-amber-50' : ''}`}>
        {isGroupMode ? <span className="font-medium text-xs">{row.stockHN}</span> : 
            <EditableCell value={row.stockHN} onSave={(val) => onUpdateField(row.sku, 'stockHN', val)} type="number" className={row.stockHN < config.lowStockThreshold ? 'text-amber-700 font-bold' : ''} />
        }
      </td>

      <td className={`px-4 py-3 w-20 text-center ${row.stockHCM < config.lowStockThreshold ? 'bg-amber-50' : ''}`}>
        {isGroupMode ? <span className="font-medium text-xs">{row.stockHCM}</span> : 
            <EditableCell value={row.stockHCM} onSave={(val) => onUpdateField(row.sku, 'stockHCM', val)} type="number" className={row.stockHCM < config.lowStockThreshold ? 'text-amber-700 font-bold' : ''} />
        }
      </td>

      <td className="px-4 py-3 text-blue-600 font-medium text-xs text-center">{row.sales30d}</td>
    </tr>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c'];
type FilterStatus = 'all' | 'loss' | 'low_stock' | 'out_of_stock' | 'best_seller';

const App: React.FC = () => {
  const [infoData, setInfoData] = useState<RawProductInfo[]>([]);
  const [invData, setInvData] = useState<RawInventory[]>([]);
  const [priceData, setPriceData] = useState<RawPricing[]>([]);
  const [mergedData, setMergedData] = useState<ProductData[]>([]);
  const [customRates, setCustomRates] = useState<Record<string, number>>({}); // Override per SKU if needed (legacy support)
  const [categoryOverrides, setCategoryOverrides] = useState<Map<string, string>>(new Map()); // SKU -> FeeCategoryID

  // Global Fee Config State (Editable by User)
  const [globalFeeConfig, setGlobalFeeConfig] = useState<Record<ShopType, FeeCategory[]>>({
    'SHOPEE_MALL': SHOPEE_MALL_IT_FEES,
    'SHOPEE_NORMAL': SHOPEE_NORMAL_IT_FEES,
    'TIKTOK_SHOP': TIKTOK_IT_FEES,
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    const savedConfig = localStorage.getItem('IT_PM_APP_CONFIG');
    return savedConfig ? JSON.parse(savedConfig) : { shopType: 'SHOPEE_MALL', useVoucherExtra: true, lowStockThreshold: 10 };
  });

  const [sortField, setSortField] = useState<keyof ProductData>('profit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [groupVariants, setGroupVariants] = useState<boolean>(false);
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isFeeConfigModalOpen, setIsFeeConfigModalOpen] = useState(false);
  const [isFeeDetailOpen, setIsFeeDetailOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [feeDetailTarget, setFeeDetailTarget] = useState<ProductData | null>(null);

  useEffect(() => { localStorage.setItem('IT_PM_APP_CONFIG', JSON.stringify(config)); }, [config]);

  // Main Data Merge
  useEffect(() => {
    // Retrieve the current active fee table from state
    const activeFeeTable = globalFeeConfig[config.shopType];
    
    // Merge using the dynamic table
    const merged = mergeData(infoData, invData, priceData, config, activeFeeTable, mergedData, customRates);
    
    // Apply local category overrides (User changed dropdown in row)
    const finalData = merged.map(p => {
        const overrideId = categoryOverrides.get(p.sku);
        if (overrideId) {
            const cat = activeFeeTable.find(c => c.id === overrideId);
            if (cat) {
                // Re-calculate derived fee with new category rate
                p.feeCategoryId = cat.id;
                p.feeRate = cat.rate;
                
                // IMPORTANT: We must recalculate the fee and profit here too because mergeData might have used default
                const breakdown = calculateFeeBreakdown(p.priceShopee, p.feeRate, config.useVoucherExtra);
                p.platformFee = breakdown.total;
                p.profit = p.priceShopee - p.costPrice - p.platformFee;
            }
        }
        return p;
    });

    setMergedData(finalData);
  }, [infoData, invData, priceData, config, customRates, globalFeeConfig, categoryOverrides]); // Added categoryOverrides dependency

  const handleUpdateProductField = (sku: string, field: keyof ProductData, value: number) => {
    if (field === 'costPrice') {
        setInfoData(prev => { const idx = prev.findIndex(i => i.sku === sku); if (idx >= 0) { const c = [...prev]; c[idx] = { ...c[idx], costPrice: value }; return c; } return prev; });
    } else if (field === 'priceShopee') {
        setPriceData(prev => { const idx = prev.findIndex(i => i.sku === sku); if (idx >= 0) { const c = [...prev]; c[idx] = { ...c[idx], priceShopee: value }; return c; } return prev; });
    } else if (field === 'stockHN' || field === 'stockHCM') {
        setInvData(prev => { const idx = prev.findIndex(i => i.sku === sku); if (idx >= 0) { const c = [...prev]; c[idx] = { ...c[idx], [field]: value }; return c; } return prev; });
    } 
  };

  const handleUpdateCategory = (sku: string, newCategoryId: string) => {
      // 1. Update Persistent State
      setCategoryOverrides(prev => {
          const newMap = new Map(prev);
          newMap.set(sku, newCategoryId);
          return newMap;
      });

      // 2. Immediate Local Update (for visual feedback before next full merge/render)
      setMergedData(prev => prev.map(p => {
          if (p.sku === sku) {
              const activeFeeTable = globalFeeConfig[config.shopType];
              const cat = activeFeeTable.find(c => c.id === newCategoryId);
              const newRate = cat ? cat.rate : 0;
              
              // Recalculate Fee
              const breakdown = calculateFeeBreakdown(p.priceShopee, newRate, config.useVoucherExtra);
              const newFee = breakdown.total;
              const newProfit = p.priceShopee - p.costPrice - newFee;

              return { 
                  ...p, 
                  feeCategoryId: newCategoryId,
                  feeRate: newRate,
                  platformFee: newFee,
                  profit: newProfit
              };
          }
          return p;
      }));
  };

  const handleUpdateGlobalCategories = (shopType: ShopType, newCategories: FeeCategory[]) => {
      setGlobalFeeConfig(prev => ({ ...prev, [shopType]: newCategories }));
  };

  const handleSaveProduct = (product: Partial<ProductData> & { sku: string }) => {
    const { sku, name, costPrice, priceShopee, priceWeb, stockHN, stockHCM, feeCategoryId } = product;
    setInfoData(prev => { const idx = prev.findIndex(p => p.sku === sku); return idx >= 0 ? prev.map((p, i) => i === idx ? { ...p, name: name || p.name, costPrice: costPrice ?? p.costPrice } : p) : [...prev, { sku, name: name || '', costPrice: costPrice || 0 }]; });
    setInvData(prev => { const idx = prev.findIndex(p => p.sku === sku); return idx >= 0 ? prev.map((p, i) => i === idx ? { ...p, stockHN: stockHN ?? p.stockHN, stockHCM: stockHCM ?? p.stockHCM } : p) : [...prev, { sku, stockHN: stockHN || 0, stockHCM: stockHCM || 0, sales30d: 0 }]; });
    setPriceData(prev => { const idx = prev.findIndex(p => p.sku === sku); return idx >= 0 ? prev.map((p, i) => i === idx ? { ...p, priceShopee: priceShopee ?? p.priceShopee, priceWeb: priceWeb ?? p.priceWeb } : p) : [...prev, { sku, priceWeb: priceWeb || 0, priceShopee: priceShopee || 0 }]; });
    
    if (feeCategoryId) {
       // For new product, also set override so it sticks
       setCategoryOverrides(prev => {
           const newMap = new Map(prev);
           newMap.set(sku, feeCategoryId);
           return newMap;
       });
    }
  };

  const handleExportCSV = () => {
    if (mergedData.length === 0) return;
    const headers = ['SKU','Tên Hàng Hóa','Ngành Hàng','Phí (%)','Giá Vốn','Giá Bán','Phí Sàn','Lãi Lỗ','Kho HN','Kho HCM','Bán 30d'];
    const activeFeeTable = globalFeeConfig[config.shopType];
    const csvRows = mergedData.map(row => {
      const cat = activeFeeTable.find(c => c.id === row.feeCategoryId);
      return [`"${row.sku}"`,`"${row.name.replace(/"/g, '""')}"`,`"${cat?.name || 'N/A'}"`,row.feeRate,row.costPrice,row.priceShopee,row.platformFee,row.profit,row.stockHN,row.stockHCM,row.sales30d].join(',');
    });
    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.setAttribute('download', `Bao_cao_${config.shopType}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const processedData = useMemo(() => {
    let data = [...mergedData];
    if (filterText) { const lower = filterText.toLowerCase(); data = data.filter(p => p.sku.toLowerCase().includes(lower) || p.name.toLowerCase().includes(lower)); }
    if (categoryFilter !== 'all') { data = data.filter(p => p.feeCategoryId === categoryFilter); }
    if (statusFilter === 'loss') data = data.filter(p => p.profit <= 0);
    else if (statusFilter === 'low_stock') data = data.filter(p => (p.stockHN + p.stockHCM) > 0 && (p.stockHN + p.stockHCM) < config.lowStockThreshold);
    else if (statusFilter === 'out_of_stock') data = data.filter(p => p.stockHN + p.stockHCM === 0);
    else if (statusFilter === 'best_seller') data = data.filter(p => p.sales30d > 0).sort((a,b) => b.sales30d - a.sales30d).slice(0, 20);

    if (groupVariants) {
       const groupedMap = new Map<string, ProductData & { variantCount: number }>();
       data.forEach(item => {
        const separatorIndex = item.sku.lastIndexOf('_') > -1 ? item.sku.lastIndexOf('_') : item.sku.lastIndexOf('-');
        const baseSku = separatorIndex > 0 ? item.sku.substring(0, separatorIndex) : item.sku;
        if (!groupedMap.has(baseSku)) groupedMap.set(baseSku, { ...item, sku: baseSku, variantCount: 1 });
        else {
          const existing = groupedMap.get(baseSku)!;
          existing.stockHN += item.stockHN; existing.stockHCM += item.stockHCM; existing.sales30d += item.sales30d;
          existing.costPrice = (existing.costPrice + item.costPrice) / 2; 
          existing.priceShopee = (existing.priceShopee + item.priceShopee) / 2;
          existing.platformFee = (existing.platformFee + item.platformFee) / 2;
          existing.profit = (existing.profit + item.profit);
          existing.variantCount += 1;
        }
      });
      data = Array.from(groupedMap.values());
    }

    if (statusFilter !== 'best_seller') {
        data.sort((a, b) => {
          const valA = a[sortField]; const valB = b[sortField];
          if (typeof valA === 'number' && typeof valB === 'number') return sortOrder === 'asc' ? valA - valB : valB - valA;
          return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        });
    }
    return data;
  }, [mergedData, sortField, sortOrder, filterText, categoryFilter, statusFilter, groupVariants, config.lowStockThreshold]);

  const stats = useMemo(() => ({
      totalItems: mergedData.length,
      lossMaking: mergedData.filter(p => p.profit <= 0).length,
      lowStock: mergedData.filter(p => (p.stockHN + p.stockHCM) > 0 && (p.stockHN < config.lowStockThreshold || p.stockHCM < config.lowStockThreshold)).length
  }), [mergedData, config.lowStockThreshold]);

  const barChartData = useMemo(() => {
    const sorted = [...mergedData].sort((a, b) => b.profit - a.profit);
    return [...sorted.slice(0, 5), ...sorted.slice(-5).reverse()].map(p => ({ name: p.sku, profit: p.profit, sales: p.sales30d }));
  }, [mergedData]);

  const pieChartData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    const activeFeeTable = globalFeeConfig[config.shopType];
    mergedData.forEach(p => {
        const catName = activeFeeTable.find(c => c.id === p.feeCategoryId)?.name.split('-')[0].trim() || 'Khác';
        if (p.profit > 0) categoryMap.set(catName, (categoryMap.get(catName) || 0) + p.profit);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [mergedData, config.shopType, globalFeeConfig]);

  const shopTabs: { id: ShopType, label: string, icon: React.ReactNode, color: string }[] = [
    { id: 'SHOPEE_NORMAL', label: 'Shopee Thường', icon: <Store size={16} />, color: 'orange' },
    { id: 'SHOPEE_MALL', label: 'Shopee Mall', icon: <Store size={16} />, color: 'red' },
    { id: 'TIKTOK_SHOP', label: 'TikTok Shop', icon: <Store size={16} />, color: 'black' },
  ];

  const filterTabs: { id: FilterStatus, label: string, icon: React.ReactNode, activeClass: string, defaultClass: string }[] = [
      { id: 'all', label: 'Tất cả', icon: <Layers size={14} />, activeClass: 'bg-slate-800 text-white', defaultClass: 'bg-white text-slate-600' },
      { id: 'loss', label: 'Đang Lỗ', icon: <XCircle size={14} />, activeClass: 'bg-red-600 text-white', defaultClass: 'bg-white text-red-600 border border-red-200' },
      { id: 'low_stock', label: 'Sắp hết hàng', icon: <AlertTriangle size={14} />, activeClass: 'bg-amber-500 text-white', defaultClass: 'bg-white text-amber-600 border border-amber-200' },
      { id: 'best_seller', label: 'Top Bán Chạy', icon: <TrendingUp size={14} />, activeClass: 'bg-indigo-600 text-white', defaultClass: 'bg-white text-indigo-600 border border-indigo-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSave={handleSaveProduct}
        initialData={editingProduct}
        feeCategories={globalFeeConfig[config.shopType]}
      />

      <FeeConfigModal 
        isOpen={isFeeConfigModalOpen}
        onClose={() => setIsFeeConfigModalOpen(false)}
        shopType={config.shopType}
        feeCategories={globalFeeConfig[config.shopType]}
        onUpdateCategories={handleUpdateGlobalCategories}
      />

      <FeeDetailModal 
        isOpen={isFeeDetailOpen}
        onClose={() => setIsFeeDetailOpen(false)}
        product={feeDetailTarget}
        config={config}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-blue-600 p-2 rounded-lg text-white"><LayoutDashboard size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">IT Product Manager</h1>
              <p className="text-xs text-slate-500">Hệ thống nhập liệu & Tối ưu lợi nhuận</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer select-none ${config.useVoucherExtra ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
              onClick={() => setConfig({...config, useVoucherExtra: !config.useVoucherExtra})}
            >
              <Receipt size={16} /> <span className="font-medium">Voucher Extra (2.5%)</span>
              <div className={`w-3 h-3 rounded-full border ${config.useVoucherExtra ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}`}></div>
            </div>
             <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 text-sm">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-slate-600 font-medium hidden sm:inline">Ngưỡng Tồn:</span>
              <input type="number" value={config.lowStockThreshold} onChange={(e) => setConfig({...config, lowStockThreshold: Number(e.target.value)})} className="w-12 bg-transparent border-b border-slate-300 text-center font-bold focus:outline-none focus:border-blue-500"/>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span className="bg-blue-100 text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span> Nhập Dữ Liệu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileUpload label="File 1: Thông tin cơ bản" description="Chứa SKU, Tên hàng, Giá vốn" accept=".csv" requiredFields={['sku', 'name', 'costPrice']} onDataLoaded={(data) => setInfoData(data)}/>
            <FileUpload label="File 2: Kho & Bán hàng" description="Chứa SKU, Tồn HN/HCM, SL bán" accept=".csv" requiredFields={['sku', 'stockHN', 'stockHCM', 'sales30d']} onDataLoaded={(data) => setInvData(data)}/>
            <FileUpload label="File 3: Giá bán" description="Chứa SKU, Giá Web, Giá Shopee" accept=".csv" requiredFields={['sku', 'priceWeb', 'priceShopee']} onDataLoaded={(data) => setPriceData(data)}/>
          </div>
        </section>

        {mergedData.length > 0 && (
          <>
            <section className="mb-8">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-100"><p className="text-sm text-slate-500">Tổng sản phẩm</p><p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p></div>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-100 border-l-4 border-l-red-500"><p className="text-sm text-slate-500">Sản phẩm Lỗ vốn</p><p className="text-2xl font-bold text-red-600">{stats.lossMaking}</p></div>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-100 border-l-4 border-l-amber-500"><p className="text-sm text-slate-500">Cảnh báo tồn kho</p><p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p></div>
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-100 flex flex-col">
                        <h3 className="text-sm font-semibold text-slate-600 mb-2">Top Lợi Nhuận</h3>
                        <div className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-25} textAnchor="end" /><YAxis tickFormatter={(val) => `${val/1000}k`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><ReferenceLine y={0} stroke="#000" /><Bar dataKey="profit" fill="#3b82f6" name="Lãi/Lỗ" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-slate-100 flex flex-col">
                        <h3 className="text-sm font-semibold text-slate-600 mb-2">Nguồn Lợi Nhuận</h3>
                        <div className="flex-1 min-h-0 flex items-center justify-center text-xs"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieChartData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} fill="#8884d8" paddingAngle={5} dataKey="value">{pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip formatter={(val) => formatCurrency(Number(val))} /><Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '10px' }}/></PieChart></ResponsiveContainer></div>
                    </div>
                 </div>
            </section>

            <ChatAnalysisPanel products={mergedData} config={config} />

            <section className="mt-8">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><span className="bg-blue-100 text-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span> Bảng Dữ Liệu Tổng Hợp</h2>

              <div className="flex flex-wrap items-center gap-2 mb-0 bg-slate-200 p-1 rounded-t-lg w-fit">
                {shopTabs.map((tab) => (
                  <button key={tab.id} onClick={() => setConfig({ ...config, shopType: tab.id })} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${config.shopType === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
                <button onClick={() => setIsFeeConfigModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-white hover:text-blue-600 transition-colors ml-2" title="Cấu hình biểu phí">
                   <Settings size={16} /> <span className="hidden sm:inline">Cấu hình phí</span>
                </button>
              </div>

              <div className="bg-white border-x border-t border-gray-200 p-3 flex gap-2 overflow-x-auto no-scrollbar items-center">
                 <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Trạng thái:</span>
                 {filterTabs.map(f => (
                     <button key={f.id} onClick={() => setStatusFilter(f.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm whitespace-nowrap border ${statusFilter === f.id ? f.activeClass : f.defaultClass}`}>
                         {f.icon} {f.label}
                     </button>
                 ))}
              </div>

              <div className="bg-white p-4 border-x border-t border-gray-200 flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Filter size={16} className="text-gray-500" />
                    <select className="bg-transparent text-sm text-gray-700 focus:outline-none border-none p-0 max-w-[150px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                      <option value="all">Tất cả ngành hàng</option>
                      {globalFeeConfig[config.shopType].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setGroupVariants(!groupVariants)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${groupVariants ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <Layers size={16} /> Gộp biến thể
                  </button>
                </div>

                <div className="flex gap-3 w-full md:w-auto items-center">
                  <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all hover:shadow-md whitespace-nowrap">
                    <Plus size={16} /> Thêm SP
                  </button>
                   <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" placeholder="Tìm SKU hoặc Tên..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" value={filterText} onChange={(e) => setFilterText(e.target.value)}/>
                  </div>
                  <button onClick={handleExportCSV} disabled={mergedData.length === 0} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                    <Download size={16} /> Excel
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-b-lg shadow overflow-hidden border border-gray-200 border-t-0">
                <div className="overflow-x-auto pb-20">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Tên Hàng Hóa</th>
                        <th className="px-2 py-3 text-center w-48">Danh mục phí (Cấp 3)</th>
                        <th className="px-4 py-3 text-right">Giá Vốn</th>
                        <th className="px-4 py-3 text-right">Giá Bán (Sàn)</th>
                        <th className="px-4 py-3 text-right">Phí Sàn</th>
                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('profit'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>
                          <div className="flex items-center justify-end gap-1">Lãi Lỗ {sortField === 'profit' && <ArrowUpDown size={12} className={sortOrder === 'asc' ? 'rotate-180' : ''} />}</div>
                        </th>
                        <th className="px-4 py-3 text-center">Kho HN</th>
                        <th className="px-4 py-3 text-center">Kho HCM</th>
                        <th className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100" onClick={() => { setSortField('sales30d'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}>Bán 30d</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {processedData.map((row) => (
                        <ProductRow 
                            key={row.sku} 
                            row={row} 
                            config={config}
                            feeCategories={globalFeeConfig[config.shopType]}
                            isGroupMode={groupVariants}
                            onUpdateField={handleUpdateProductField}
                            onUpdateCategory={handleUpdateCategory}
                            onEditClick={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                            onShowFeeDetail={(p) => { setFeeDetailTarget(p); setIsFeeDetailOpen(true); }}
                        />
                      ))}
                      {processedData.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-gray-400 flex flex-col items-center justify-center">
                              <Search className="w-8 h-8 mb-2 opacity-50" />
                              <p>Không tìm thấy dữ liệu phù hợp</p>
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
                    <span>Voucher Extra: {config.useVoucherExtra ? '2.5%' : 'Tắt'}</span>
                    <span>Hạ Tầng: 4,620đ</span>
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