import React, { useRef, useState, useEffect } from 'react';
import { Upload, Link, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (value: string, file?: File) => void;
  accept?: string;
  type?: 'image' | 'file';
  hideUploadButton?: boolean;
  compact?: boolean;
  onDelete?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, value, onChange, accept, type = 'file', hideUploadButton = false, compact = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  
  // Extract filename from URL when value changes
  useEffect(() => {
    if (value) {
      try {
        // Extract the filename from the URL
        const url = new URL(value);
        const pathSegments = url.pathname.split('/');
        const filename = pathSegments[pathSegments.length - 1];
        if (filename) {
          setCurrentFilePath(filename);
        }
      } catch (error) {
        console.error('Error extracting filename from URL:', error);
      }
    } else {
      setCurrentFilePath(null);
    }
  }, [value]);

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

  const handleDeleteFile = async () => {
    if (currentFilePath) {
      try {
        // Delete from Supabase Storage
        const { error } = await supabase.storage.from('files').remove([currentFilePath]);
        
        if (error) {
          console.error('Error deleting file from storage:', error);
          alert('Failed to delete file: ' + error.message);
          return;
        }
        
        // Clear the value in the parent component
        onChange('');
        setCurrentFilePath(null);
      } catch (error) {
        console.error('Error in delete operation:', error);
        alert('An error occurred while deleting the file');
      }
    }
  };

  return (
    <div className={compact ? "space-y-0" : "space-y-3"}>
      {label && <label className="block text-sm font-medium text-text mb-2">{label}</label>}
      {/* URL Input */}
      <div className={compact ? "flex gap-2 items-center min-h-[40px]" : "flex gap-2 items-end"}>
        <div className="flex-1 relative w-full">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder="Paste URL here"
            className={compact ? "w-full pl-10 pr-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text h-10 text-sm" : "w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-row text-text text-sm"}
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={handleDeleteFile}
            className={compact ? "flex items-center justify-center w-8 h-8 text-red-600 hover:bg-red-100 rounded-full transition-colors" : "flex items-center justify-center w-9 h-9 text-red-600 hover:bg-red-100 rounded-full transition-colors"}
            title="Delete file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        {!hideUploadButton && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={compact ? "flex items-center gap-1 md:gap-2 px-2 md:px-4 bg-card text-primary border border-border rounded-lg hover:bg-row transition-colors disabled:opacity-60 h-10 text-xs md:text-sm" : "flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-card text-primary border border-border rounded-lg hover:bg-row transition-colors disabled:opacity-60 text-sm"}
            disabled={uploading}
          >
            <Upload className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload'}</span>
            <span className="sm:hidden">{uploading ? '...' : 'Up'}</span>
          </button>
        )}
        {value && type === 'image' && (
          <div className="ml-2 flex-shrink-0">
            <img src={value} alt="Preview" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded border" />
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