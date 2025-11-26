import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { ProductData, AppConfig } from '../types';

interface AnalysisPanelProps {
  products: ProductData[];
  config: AppConfig;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ products, config }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!process.env.API_KEY) {
      setError("Thiếu API Key. Vui lòng cấu hình environment variable.");
      return;
    }
    
    if (products.length === 0) {
      setError("Chưa có dữ liệu sản phẩm để phân tích.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare a summary payload to avoid token limits
      const summaryData = products.map(p => ({
        sku: p.sku,
        name: p.name,
        profit: p.profit,
        priceShopee: p.priceShopee,
        feeRate: p.feeRate,
        stockHN: p.stockHN,
        stockHCM: p.stockHCM,
        sales30d: p.sales30d
      })).slice(0, 50); // Analyze top 50 items for efficiency in this demo

      const prompt = `
        Bạn là một chuyên gia quản lý kinh doanh ngành hàng Máy tính & Laptop.
        Dưới đây là dữ liệu (mẫu 50 sản phẩm đầu tiên) từ hệ thống:
        ${JSON.stringify(summaryData)}

        Cấu hình hiện tại: 
        - Ngưỡng tồn kho thấp: ${config.lowStockThreshold}
        - Loại Shop: ${config.shopType}
        - Sử dụng Voucher Extra: ${config.useVoucherExtra ? 'Có' : 'Không'}

        Hãy phân tích dữ liệu này và đưa ra báo cáo ngắn gọn bằng tiếng Việt (Markdown format):
        1. **Tổng quan lợi nhuận**: Đánh giá biên lợi nhuận của ngành hàng IT này (thường thấp hơn thời trang).
        2. **Cảnh báo tồn kho**: Những mã hàng (Laptop, Linh kiện...) cần nhập gấp.
        3. **Cảnh báo lỗ**: Những mã hàng đang bị âm lợi nhuận do phí sàn cao.
        4. **Đề xuất hành động**: 3 hành động cụ thể để tối ưu dòng tiền cho cửa hàng công nghệ.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAnalysis(response.text || "Không thể tạo phân tích.");
    } catch (err: any) {
      console.error(err);
      setError("Lỗi kết nối Gemini API: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6 border border-purple-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="text-purple-600" />
          Trợ lý AI Phân tích (Chuyên gia IT)
        </h2>
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Đang suy nghĩ...' : 'Phân tích Dữ liệu'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {analysis ? (
        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 bg-purple-50 p-6 rounded-lg border border-purple-100">
           {/* Simple markdown rendering by splitting newlines for safety in this strict React only env */}
           {analysis.split('\n').map((line, i) => {
             if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace('###', '')}</h3>;
             if (line.startsWith('**')) return <p key={i} className="font-bold my-1">{line.replace(/\*\*/g, '')}</p>;
             if (line.startsWith('-')) return <li key={i} className="ml-4 list-disc">{line.substring(1)}</li>;
             return <p key={i} className="mb-1">{line}</p>;
           })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          Nhấn nút để AI phân tích tình hình kinh doanh các sản phẩm IT của bạn.
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;