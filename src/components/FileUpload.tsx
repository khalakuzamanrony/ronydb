import React, { useRef, useState } from 'react';
import { Upload, Link } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (value: string, file?: File) => void;
  accept?: string;
  type?: 'image' | 'file';
  hideUploadButton?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, value, onChange, accept, type = 'file', hideUploadButton = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setUploadProgress(0);
      // Upload to Supabase Storage
      const filePath = file.name;
      const { data, error } = await supabase.storage.from('files').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (error) {
        alert('Upload failed: ' + error.message);
        setUploading(false);
        return;
      }
      // Get public URL
      const { data: publicData } = supabase.storage.from('files').getPublicUrl(filePath);
      if (publicData?.publicUrl) {
        onChange(publicData.publicUrl, file);
      } else {
        alert('Failed to get public URL');
      }
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text mb-2">{label}</label>
      
      {/* URL Input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="Paste URL here"
            className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text"
          />
        </div>
        {!hideUploadButton && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-card text-primary border border-border rounded-lg hover:bg-row transition-colors disabled:opacity-60"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        {value && type === 'image' && (
          <div className="ml-2 flex-shrink-0">
            <img src={value} alt="Preview" className="w-20 h-20 object-cover rounded border" />
          </div>
        )}
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} />
        </div>
      )}
    </div>
  );
};

export default FileUpload;