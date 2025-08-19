import React from "react";
import FileUpload from "./FileUpload";
import { Trash2, GripVertical } from "lucide-react";
import CopyButton from "./CopyButton";

export interface CustomField {
  id: string;
  type: string;
  label: string;
  value: string;
  order?: number;
}

interface CustomFieldRowProps {
  field: CustomField;
  onChange: (updates: Partial<CustomField>) => void;
  onDelete: () => void;
  index?: number;
  showDelete?: boolean;
}

const CustomFieldRow: React.FC<CustomFieldRowProps & { showDragHandle?: boolean; dragHandleProps?: any }> = ({ field, onChange, onDelete, showDelete = true, showDragHandle = false, dragHandleProps }) => {
  return (
    <div className="relative flex flex-col sm:flex-row md:flex-row items-stretch gap-2 w-full p-3 md:p-4 bg-sectionheader rounded-lg mb-4">
      {dragHandleProps && (
        <span {...dragHandleProps} className="flex items-center cursor-move mr-2 select-none">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </span>
      )}
      <div className="flex items-center w-full sm:w-32 md:w-32">
        <input
          type="text"
          value={field.label}
          onChange={e => onChange({ label: e.target.value })}
          placeholder="Label"
          className="h-10 px-2 md:px-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-text bg-transparent text-sm w-full"
        />
      </div>
      <div className="flex items-center w-full sm:w-28 md:w-28">
        <select
          value={field.type}
          onChange={e => onChange({ type: e.target.value })}
          className="h-10 px-2 py-0 border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-text bg-row text-sm w-full"
        >
          <option value="text">Text</option>
          <option value="link">Link</option>
          <option value="image">Image</option>
          <option value="date">Date</option>
          <option value="number">Number</option>
          <option value="file">File</option>
        </select>
      </div>
      <div className="w-full sm:flex-1 md:flex-1 relative">
        {field.type === "image" || field.type === "file" ? (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <FileUpload
                label=""
                value={field.value}
                onChange={(value, file) => onChange({ value })}
                onDelete={() => onChange({ value: "" })}
                accept={field.type === "image" ? "image/*" : "*"}
                type={field.type}
                hideUploadButton={false}
                compact={true}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="relative">
            <input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              value={field.value}
              onChange={e => onChange({ value: e.target.value })}
              placeholder={
                field.type === "text"
                  ? "Enter text"
                  : field.type === "link"
                  ? "Paste link (https://...)"
                  : field.type === "date"
                  ? "Select date"
                  : field.type === "number"
                  ? "Enter number"
                  : field.type === "file"
                  ? "Upload file"
                  : "Value"
              }
              className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-text min-w-0 bg-transparent text-sm pr-10"
            />
            {field.value && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <CopyButton text={field.value} className="flex-shrink-0" />
              </div>
            )}
          </div>
        )}
      </div>
      {showDelete && (
        <button
          onClick={onDelete}
          className="w-full sm:w-auto md:w-auto mt-2 sm:mt-0 md:mt-0 text-red-600 hover:text-red-800 p-1 z-10"
          title="Delete field"
        >
          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      )}
    </div>
  );
};

export default CustomFieldRow;