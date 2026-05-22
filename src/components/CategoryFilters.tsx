import React from 'react';
import { CATEGORIES } from '../data';

interface CategoryFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilters({
  selectedCategory,
  onSelectCategory
}: CategoryFiltersProps) {
  return (
    <div className="w-full flex flex-col space-y-2 select-none" id="category-filter-bar">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2.5 px-1 scrollbar-none no-scrollbar" id="category-tabs-container">
        {/* All trigger */}
        <button
          id="category-filter-all"
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 border hover:scale-[1.02] active:scale-[0.98] ${
            selectedCategory === null
              ? 'bg-slate-950 dark:bg-slate-100 border-slate-950 dark:border-slate-50 text-white dark:text-slate-950 shadow-[0_2px_10px_rgba(15,23,42,0.15)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.08)]'
              : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-slate-200 dark:border-slate-800/75 text-slate-650 dark:text-slate-355 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-705 hover:shadow-2xs'
          }`}
        >
          All Ideas
        </button>

        {/* Regular Categories */}
        {CATEGORIES.map((category) => (
          <button
            key={category}
            id={`category-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 border hover:scale-[1.02] active:scale-[0.98] ${
              selectedCategory === category
                ? 'bg-slate-950 dark:bg-slate-100 border-slate-950 dark:border-slate-50 text-white dark:text-slate-950 shadow-[0_2px_10px_rgba(15,23,42,0.15)] dark:shadow-[0_2px_10px_rgba(255,255,255,0.08)]'
                : 'bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border-slate-200 dark:border-slate-800/75 text-slate-650 dark:text-slate-355 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-705 hover:shadow-2xs'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
