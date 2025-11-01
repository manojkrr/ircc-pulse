import React from 'react';

interface ProgramCategoryFilterProps {
  selected: string;
  onChange: (value: string) => void;
}

export const ProgramCategoryFilter: React.FC<ProgramCategoryFilterProps> = ({ selected, onChange }) => {
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'favorites', label: '⭐ Favorites' },
    { value: 'spousal-', label: 'Spousal' },
    { value: 'refugees-', label: 'Refugees' },
    { value: 'pnp-', label: 'PNP' },
    { value: 'citizen-', label: 'Citizenship' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
            selected === cat.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};
