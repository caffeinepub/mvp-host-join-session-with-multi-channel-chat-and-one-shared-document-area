import React, { useState, useRef } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableTabBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onReorder: (newOrder: string[]) => void;
  canReorder: boolean;
  accentColor?: string;
}

export default function DraggableTabBar({
  tabs,
  activeTab,
  onTabChange,
  onReorder,
  canReorder,
  accentColor = '#7c3aed',
}: DraggableTabBarProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    if (!canReorder) return;
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (!canReorder || dragItem.current === null) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (!canReorder || dragItem.current === null || dragOverIndex === null) {
      setDragIndex(null);
      setDragOverIndex(null);
      dragItem.current = null;
      return;
    }

    const newTabs = [...tabs];
    const draggedTab = newTabs[dragItem.current];
    newTabs.splice(dragItem.current, 1);
    newTabs.splice(dragOverIndex, 0, draggedTab);
    onReorder(newTabs);

    setDragIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-card border-b border-border overflow-x-auto">
      <div className="flex items-center min-w-max px-2">
        {tabs.map((tab, index) => {
          const isActive = tab === activeTab;
          const isDragging = dragIndex === index;
          const isDragOver = dragOverIndex === index && dragIndex !== index;

          return (
            <div
              key={tab}
              draggable={canReorder}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onClick={() => onTabChange(tab)}
              className={`
                relative flex items-center gap-1.5 px-4 py-3 cursor-pointer select-none
                text-sm font-medium transition-all duration-150
                ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}
                ${isDragging ? 'opacity-40' : 'opacity-100'}
                ${isDragOver ? 'bg-accent/20' : ''}
                ${canReorder ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
              `}
            >
              {canReorder && (
                <GripVertical className="w-3 h-3 opacity-30 flex-shrink-0" />
              )}
              <span>{tab}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
              {isDragOver && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
