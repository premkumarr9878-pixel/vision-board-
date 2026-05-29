import React from 'react';
import { CATEGORIES } from '../data';

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  categoryCounts: Record<string, number>;
}

export default function CategoryFilters({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {}
}: CategoryFiltersProps) {
  const totalIdeas = Object.values(categoryCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full select-none" id="category-filter-bar">
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 px-1 scrollbar-none no-scrollbar mobile-scroll-container touch-pan-x" id="category-tabs-container">
        {/* All trigger */}
        <button
          id="category-filter-all"
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all duration-300 whitespace-nowrap border-2 cursor-pointer select-none flex items-center space-x-2 shrink-0 ${
            selectedCategory === null
              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02] z-10'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-600/40'
          }`}
        >
          <span>All Ideas</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${selectedCategory === null ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {totalIdeas}
          </span>
        </button>

        {/* Regular Categories */}
        {CATEGORIES.map((category) => {
          const count = (categoryCounts && categoryCounts[category]) || 0;
          return (
            <button
              key={category}
              id={`category-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all duration-300 whitespace-nowrap border-2 cursor-pointer select-none flex items-center space-x-2 shrink-0 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02] z-10'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-blue-600/40'
              }`}
            >
              <span>{category}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${selectedCategory === category ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
