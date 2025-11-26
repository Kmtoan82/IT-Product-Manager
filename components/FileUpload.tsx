import React, { useRef, useState, useEffect } from 'react';
import { Upload, FileCheck, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { parseCSV } from '../services/dataService';

interface FileUploadProps {
  label: string;
  description: string;
  accept: string;
  onDataLoaded: (data: any[]) => void;
  requiredFields: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ label, description, accept, onDataLoaded, requiredFields }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setFileName(file.name);
    setError(null);
    setShowSuccess(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        try {
          const data = await parseCSV<any>(text);
          // Basic validation: check if first row has required keys
          if (data.length > 0) {
            const keys = Object.keys(data[0]);
            const missing = requiredFields.filter(field => !keys.includes(field));
            if (missing.length > 0) {
              setError(`Thiếu cột bắt buộc: ${missing.join(', ')}`);
              setFileName(null);
              return;
            }
            onDataLoaded(data);
            setShowSuccess(true);
          } else {
             setError("File rỗng");
          }
        } catch (err) {
          setError("Lỗi đọc file CSV");
          console.error(err);
        }
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add BOM for Excel support (UTF-8)
    const headers = requiredFields.join(',');
    const csvContent = `\uFEFF${headers}\n`; 
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Create a filename based on the label
    const safeName = label.split(':')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `mau_${safeName}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-800">{label}</h3>
        <button 
          onClick={handleDownloadTemplate}
          className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-1 rounded transition-colors"
          title="Tải file mẫu CSV"
        >
          <Download size={12} />
          <span>Tải mẫu</span>
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      
      <div 
        className={`flex-1 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-4 transition-all cursor-pointer relative ${
          error ? 'border-red-300 bg-red-50' : 
          showSuccess ? 'border-green-500 bg-green-50' :
          fileName ? 'border-blue-300 bg-blue-50' : 
          'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept={accept} 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        {showSuccess ? (
           <div className="text-center text-green-600 animate-in fade-in zoom-in duration-300">
             <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
             <span className="text-sm font-bold">Đã tải thành công!</span>
           </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : fileName ? (
          <div className="text-center text-blue-700">
            <FileCheck className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm font-medium break-all line-clamp-2">{fileName}</span>
            <span className="text-xs opacity-75 block mt-1">Nhấn để đổi file</span>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Upload className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Chọn file CSV</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-400">
        Cột: {requiredFields.join(', ')}
      </div>
    </div>
  );
};

export default FileUpload;