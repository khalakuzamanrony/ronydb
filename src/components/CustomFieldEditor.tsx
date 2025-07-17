import React, { useState } from 'react';
import { Plus, X, Upload, Link, Trash2 } from 'lucide-react';
import { CustomField } from '../types/cv';
import { supabase } from '../utils/supabaseClient';

interface CustomFieldEditorProps {
  fields: CustomField[];
  onFieldsChange: (fields: CustomField[]) => void;
}

export const CustomFieldEditor: React.FC<CustomFieldEditorProps> = ({
  fields,
  onFieldsChange,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    type: 'text',
    label: '',
    value: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'link', label: 'Link' },
    { value: 'image', label: 'Image' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
  ];

  const handleAddField = () => {
    if (newField.label && newField.value) {
      const field: CustomField = {
        id: Date.now().toString(),
        type: newField.type as CustomField['type'],
        label: newField.label,
        value: newField.value,
        order: fields.length,
      };
      onFieldsChange([...fields, field]);
      setNewField({ type: 'text', label: '', value: '' });
      setShowAddForm(false);
    }
  };

  const handleRemoveField = (id: string) => {
    onFieldsChange(fields.filter(field => field.id !== id));
  };

  const handleUpdateField = (id: string, updates: Partial<CustomField>) => {
    onFieldsChange(
      fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleFileUpload = async (file: File, fieldId?: string) => {
    setUploading(true);
    setUploadProgress(0);
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
      if (fieldId) {
        handleUpdateField(fieldId, { value: publicData.publicUrl });
      } else {
        setNewField((prev) => ({ ...prev, value: publicData.publicUrl }));
      }
    } else {
      alert('Failed to get public URL');
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const renderFieldInput = (field: CustomField | Partial<CustomField>, isNew = false) => {
    const value = field.value || '';
    const type = field.type || 'text';

    const updateValue = (newValue: string) => {
      if (isNew) {
        setNewField({ ...newField, value: newValue });
      } else {
        handleUpdateField(field.id!, { value: newValue });
      }
    };

    switch (type) {
      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  value={value}
                  onChange={(e) => updateValue(e.target.value)}
                  placeholder="Paste image URL"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, isNew ? undefined : field.id);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            {value && (
              <img
                src={value}
                alt="Preview"
                className="w-16 h-16 object-cover rounded border"
              />
            )}
          </div>
        );
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      default:
        return (
          <input
            type={type === 'link' ? 'url' : 'text'}
            value={value}
            onChange={(e) => updateValue(e.target.value)}
            placeholder={type === 'link' ? 'https://example.com' : 'Enter value'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map((field) => (
        <div key={field.id} className="p-4 border border-gray-200 rounded-lg break-inside-avoid overflow-hidden break-words">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={field.type}
                  onChange={(e) => handleUpdateField(field.id, { type: e.target.value as CustomField['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => handleRemoveField(field.id)}
              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md"
              title="Delete Field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            {renderFieldInput(field)}
          </div>
        </div>
      ))}

      {showAddForm ? (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={newField.label || ''}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                placeholder="Field label"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as CustomField['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            {renderFieldInput(newField, true)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddField}
              className={`px-4 py-2 rounded-md text-white ${(!newField.label || !newField.value || uploading) ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={!newField.label || !newField.value || uploading}
            >
              Add Field
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewField({ type: 'text', label: '', value: '' });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom Field
        </button>
      )}
    </div>
  );
};