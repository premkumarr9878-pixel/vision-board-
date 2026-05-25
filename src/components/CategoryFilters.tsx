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
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap border-2 cursor-pointer select-none shadow-sm ${
            selectedCategory === null
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-105'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400'
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
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap border-2 cursor-pointer select-none shadow-sm ${
              selectedCategory === category
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
