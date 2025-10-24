"use client";
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon } from '@heroicons/react/24/outline';
import type { Category } from '../../lib/types';

interface SortableCategoryListProps {
  categories: Category[];
  onReorder: (newCategories: Category[]) => void;
  disabled?: boolean;
}

interface SortableCategoryItemProps {
  category: Category;
  disabled?: boolean;
}

const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({ category, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: category._id!,
    disabled: disabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center p-4 bg-white border rounded-lg shadow-sm ${
        isDragging ? 'shadow-lg border-red-300' : 'border-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
    >
      <div className="flex-shrink-0 mr-3">
        <div
          {...attributes}
          {...listeners}
          className={`p-1 rounded cursor-grab active:cursor-grabbing ${
            disabled ? 'cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          <Bars3Icon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          {category.icon && (
            <span className="text-2xl flex-shrink-0">{category.icon}</span>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {category.description || 'No description'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 flex items-center space-x-3">
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Position {category.sortOrder || 0}
          </span>
          {category.isActive === false && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SortableCategoryList: React.FC<SortableCategoryListProps> = ({ 
  categories, 
  onReorder, 
  disabled = false 
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex(item => item._id === active.id);
      const newIndex = categories.findIndex(item => item._id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(categories, oldIndex, newIndex);
        onReorder(newCategories);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map(cat => cat._id!).filter(Boolean)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {categories.map((category) => (
            <SortableCategoryItem
              key={category._id}
              category={category}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableCategoryList;
