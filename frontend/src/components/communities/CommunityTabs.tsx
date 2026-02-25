import React, { useState, useRef } from 'react';
import { Tab, TabData } from '../../backend';
import { useReorderTabs } from '../../hooks/useQueries';
import { GripVertical } from 'lucide-react';

interface CommunityTabsProps {
  communityId: bigint;
  tabs: TabData[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  canReorder: boolean;
  isLoading: boolean;
}

const TAB_LABELS: Record<Tab, string> = {
  [Tab.home]: 'Home',
  [Tab.chat]: 'Chat',
  [Tab.lore]: 'Lore',
  [Tab.polls]: 'Polls',
  [Tab.quizzes]: 'Quizzes',
  [Tab.rules]: 'Rules',
};

export default function CommunityTabs({
  communityId,
  tabs,
  activeTab,
  onTabChange,
  canReorder,
  isLoading,
}: CommunityTabsProps) {
  const reorderMutation = useReorderTabs(communityId);
  const [localTabs, setLocalTabs] = useState<TabData[] | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);

  const displayTabs = localTabs ?? [...tabs].sort((a, b) => Number(a.order) - Number(b.order));

  const handleDragStart = (index: number) => {
    if (!canReorder) return;
    dragItem.current = index;
    setDraggingIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!canReorder) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!canReorder || dragItem.current === null) return;

    const fromIndex = dragItem.current;
    if (fromIndex === dropIndex) {
      setDraggingIndex(null);
      setDragOverIndex(null);
      dragItem.current = null;
      return;
    }

    const newTabs = [...displayTabs];
    const [moved] = newTabs.splice(fromIndex, 1);
    newTabs.splice(dropIndex, 0, moved);

    const reindexed = newTabs.map((t, i) => ({ ...t, order: BigInt(i) }));
    setLocalTabs(reindexed);
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;

    reorderMutation.mutate(reindexed.map((t) => t.tab));
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
    dragItem.current = null;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-cosmic-surface border-b border-cosmic-border px-4 py-3 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 w-16 bg-white/10 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-cosmic-surface border-b border-cosmic-border sticky top-0 z-20">
      <div className="flex overflow-x-auto scrollbar-hide px-2 py-1 gap-1">
        {displayTabs.map((tabData, index) => {
          const isActive = tabData.tab === activeTab;
          const isDragging = draggingIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={tabData.tab}
              draggable={canReorder}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={[
                'flex items-center gap-1 px-3 py-2 rounded-lg cursor-pointer select-none whitespace-nowrap transition-all text-sm font-medium shrink-0',
                isActive
                  ? 'bg-cosmic-accent text-white shadow-lg shadow-cosmic-accent/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
                isDragging ? 'opacity-40 scale-95' : '',
                isDragOver && !isDragging ? 'ring-2 ring-cosmic-accent/60 bg-white/10' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onTabChange(tabData.tab)}
            >
              {canReorder && (
                <GripVertical size={12} className="text-white/40 shrink-0" />
              )}
              {TAB_LABELS[tabData.tab]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
