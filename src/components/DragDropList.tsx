import React, { useState } from 'react';
import { GripVertical } from 'lucide-react';

interface DragDropListProps {
  items: any[];
  onReorder: (newOrder: any[]) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

const DragDropList: React.FC<DragDropListProps> = ({ items, onReorder, renderItem, className = '' }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    onReorder(newItems);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={item.id || item.name || index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 p-3 border rounded-lg mb-3 cursor-move ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
        >
          <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            {renderItem(item, index)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DragDropList;