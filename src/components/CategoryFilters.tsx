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
      <div 
        className="flex items-center space-x-2 overflow-x-auto pb-4 px-1 scrollbar-none no-scrollbar mobile-scroll-container touch-pan-x" 
        id="category-tabs-container"
      >
        <button
          id="category-filter-all"
          onClick={() => onSelectCategory(null)}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black transition-all duration-300 whitespace-nowrap border cursor-pointer select-none flex items-center space-x-1.5 sm:space-x-2 shrink-0 ${
            selectedCategory === null
              ? 'premium-gradient text-white border-transparent shadow-lg scale-[1.01] z-10'
              : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:border-[#2563EB]/40 hover:text-[#0F172A]'
          }`}
        >
          <span>All Ideas</span>
          <span className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] ${selectedCategory === null ? 'bg-white/10 text-white' : 'bg-white text-[#64748B]'}`}>
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
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black transition-all duration-300 whitespace-nowrap border cursor-pointer select-none flex items-center space-x-1.5 sm:space-x-2 shrink-0 ${
                selectedCategory === category
                  ? 'premium-gradient text-white border-transparent shadow-lg scale-[1.01] z-10'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1] hover:border-[#2563EB]/40 hover:text-[#0F172A]'
              }`}
            >
              <span>{category}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] ${selectedCategory === category ? 'bg-white/10 text-white' : 'bg-white text-[#64748B]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
