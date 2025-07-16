import React, { useRef } from 'react';
import { Upload, Link } from 'lucide-react';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (value: string, file?: File) => void;
  accept?: string;
  type?: 'image' | 'file';
}

const FileUpload: React.FC<FileUploadProps> = ({ label, value, onChange, accept, type = 'file' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url, file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="Paste URL here"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Preview */}
      {value && type === 'image' && (
        <div className="mt-2">
          <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded border" />
        </div>
      )}
    </div>
  );
};

export default FileUpload;