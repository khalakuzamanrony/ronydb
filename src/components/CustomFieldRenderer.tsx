import React from 'react';
import { CustomField } from '../types/cv';
import CopyButton from './CopyButton';
import { Download, Link as LinkIcon } from 'lucide-react';
import { downloadFile } from '../utils/cvData';

interface CustomFieldRendererProps {
  field: CustomField;
}

// Helper to extract filename from URL
const getFilenameFromUrl = (url: string) => {
  try {
    const u = new URL(url);
    const filename = u.pathname.split('/').pop() || 'file';
    return decodeURIComponent(filename).replace(/\s+/g, '_');
  } catch {
    const filename = url.split('/').pop() || 'file';
    return decodeURIComponent(filename).replace(/\s+/g, '_');
  }
};
// Helper to check if a link is a downloadable file
const isDownloadableFile = (url: string) => /\.(pdf|docx?|xlsx?|pptx?|zip|rar|jpg|jpeg|png|gif|webp|mp3|mp4|txt)$/i.test(url);
// Helper to add cache-busting param to a URL
const cacheBustedUrl = (url: string) => url ? url + (url.includes('?') ? '&' : '?') + 't=' + Date.now() : url;

const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({ field }) => {
  const renderFieldValue = () => {
    switch (field.type) {
      case 'link':
        return (
          <div className="flex flex-wrap items-center gap-1 min-w-0 text-sm">
            <a
              href={field.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-words whitespace-normal min-w-0 max-w-full flex-1"
              style={{ wordBreak: 'break-word' }}
            >
              {field.value}
            </a>
            <button
              onClick={() => window.open(field.value, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200 flex-shrink-0"
              title="Open link"
              type="button"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            {isDownloadableFile(field.value) && (
              <button
                onClick={() => downloadFile(field.value, getFilenameFromUrl(field.value))}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200 flex-shrink-0"
                title="Download file"
                type="button"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <CopyButton text={cacheBustedUrl(field.value)} className="flex-shrink-0" />
          </div>
        );
      case 'image':
        return (
          <div className="flex flex-row items-center gap-4 text-sm">
            <img src={field.value} alt={field.label} className="w-16 h-16 object-cover rounded" />
            <div className="flex flex-row items-center gap-2 ml-auto">
              <CopyButton text={cacheBustedUrl(field.value)} />
              <button
                onClick={() => downloadFile(field.value, getFilenameFromUrl(field.value))}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
                title="Download image"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="text-text break-all font-small text-sm">{getFilenameFromUrl(field.value)}</span>
            <button
              onClick={() => downloadFile(field.value, getFilenameFromUrl(field.value))}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-copybg hover:bg-accent text-primary hover:text-white transition-colors duration-200"
              title="Download file"
              type="button"
            >
              <Download className="w-4 h-4" />
            </button>
            <CopyButton text={field.value} className="flex-shrink-0" />
          </div>
        );
      default:
        return (
          <div className="flex flex-wrap items-center gap-1 min-w-0 text-sm">
            <span className="text-text break-words whitespace-normal min-w-0 max-w-full flex-1" style={{ wordBreak: 'break-word' }}>{field.value}</span>
            <CopyButton text={field.value} className="flex-shrink-0" />
          </div>
        );
    }
  };

  return (
    <div className="mb-3">
      <div className="block text-sm font-medium text-gray-600 mb-1">
        {field.label} <span className="text-xs text-gray-400">({field.type})</span>
      </div>
      {renderFieldValue()}
    </div>
  );
};

export default CustomFieldRenderer;