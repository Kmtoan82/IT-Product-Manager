import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Sparkles, Send, Bot, User, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { ProductData, AppConfig } from '../types';

interface ChatAnalysisPanelProps {
  products: ProductData[];
  config: AppConfig;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAnalysisPanel: React.FC<ChatAnalysisPanelProps> = ({ products, config }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session with context
  useEffect(() => {
    if (!process.env.API_KEY || products.length === 0) return;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Summarize data for context (Top 50 items + Aggregates)
      const summaryData = products.slice(0, 50).map(p => ({
        s: p.sku, // Short keys to save tokens
        n: p.name,
        p: p.profit,
        pr: p.priceShopee,
        st: p.stockHN + p.stockHCM,
        sa: p.sales30d,
        c: p.feeCategoryId
      }));

      const totalProfit = products.reduce((sum, p) => sum + p.profit, 0);
      const totalStock = products.reduce((sum, p) => sum + p.stockHN + p.stockHCM, 0);

      const systemInstruction = `
        Bạn là Trợ lý AI chuyên gia quản lý kinh doanh ngành hàng Máy tính & Laptop (IT Product Manager).
        
        DỮ LIỆU TỔNG QUAN:
        - Tổng lợi nhuận dự kiến: ${new Intl.NumberFormat('vi-VN').format(totalProfit)} VND
        - Tổng tồn kho: ${totalStock}
        - Cấu hình Shop: ${config.shopType}, Voucher Extra: ${config.useVoucherExtra}, Ngưỡng tồn: ${config.lowStockThreshold}
        
        DỮ LIỆU CHI TIẾT (Mẫu 50 sản phẩm đầu):
        ${JSON.stringify(summaryData)}
        
        CHÚ GIẢI DỮ LIỆU: s=SKU, n=Tên, p=Lợi nhuận, pr=Giá bán, st=Tổng tồn, sa=Bán 30 ngày, c=Loại hàng.

        NHIỆM VỤ:
        - Trả lời câu hỏi ngắn gọn, đi thẳng vào vấn đề.
        - Phân tích rủi ro tồn kho và cơ hội lợi nhuận.
        - Định dạng câu trả lời bằng Markdown (dùng **in đậm**, - gạch đầu dòng).
        - Luôn dùng tiếng Việt chuyên ngành IT.
      `;

      chatSession.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
      });

      // Initial greeting (simulate)
      setMessages([{ role: 'model', text: 'Chào bạn! Tôi đã phân tích dữ liệu sản phẩm IT của bạn. Bạn muốn tìm hiểu về **hàng tồn kho**, **sản phẩm lỗ vốn**, hay **chiến lược giá**?' }]);

    } catch (err) {
      console.error(err);
      setError("Không thể khởi tạo AI.");
    }
  }, [products, config, process.env.API_KEY]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response: GenerateContentResponse = await chatSession.current.sendMessage({ message: userMsg });
      const text = response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ Lỗi kết nối: " + err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([{ role: 'model', text: 'Dữ liệu đã được làm mới. Bạn cần hỗ trợ gì?' }]);
    // Session re-init is handled by useEffect when products change, 
    // but here we just visually clear needed.
  };

  if (!process.env.API_KEY) {
     return (
        <div className="bg-white rounded-lg shadow p-6 mt-6 border border-purple-100 flex items-center justify-center gap-2 text-amber-600">
             <AlertTriangle /> Vui lòng cấu hình API_KEY để sử dụng trợ lý AI.
        </div>
     )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-purple-100 mt-6 overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
        <h2 className="font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          Trợ lý IT Manager
        </h2>
        <button 
            onClick={resetChat} 
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors" 
            title="Xóa lịch sử chat"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
            }`}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none prose prose-sm prose-p:my-1 prose-ul:my-1'
            }`}>
              {msg.role === 'model' ? (
                  // Safe markdown rendering approximation
                  msg.text.split('\n').map((line, i) => {
                    if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
                    if (line.includes('**')) {
                         const parts = line.split('**');
                         return <p key={i}>{parts.map((p, pi) => pi % 2 === 1 ? <strong key={pi}>{p}</strong> : p)}</p>
                    }
                    return <p key={i}>{line}</p>;
                  })
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
             </div>
             <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-xs text-gray-500 italic">Đang phân tích dữ liệu...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Hỏi về doanh thu, hàng tồn, hoặc chiến lược giá..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all shadow-inner"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all shadow-md"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['Hàng nào lợi nhuận cao nhất?', 'Cảnh báo hàng tồn kho chết?', 'Tổng hợp doanh thu theo ngành?'].map(q => (
                <button 
                    key={q} 
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full whitespace-nowrap transition-colors"
                >
                    {q}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ChatAnalysisPanel;