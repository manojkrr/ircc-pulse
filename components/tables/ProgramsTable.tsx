import React, { useState, useMemo, useEffect } from 'react';
import { ProgramRow } from '../../types';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { formatMonthsYears } from '../../services/parsingUtils';
import { ProgramCategoryFilter } from '../ui/ProgramCategoryFilter';

export type SortConfig = {
  key: keyof ProgramRow | null;
  direction: 'ascending' | 'descending';
};

interface ProgramsTableProps {
  data: ProgramRow[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  isFavorite: (program: string) => boolean;
  toggleFavorite: (program: string) => void;
}

const ProgramsTable: React.FC<ProgramsTableProps> = ({ 
  data,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  sortConfig,
  setSortConfig,
  isFavorite,
  toggleFavorite
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof ProgramRow) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof ProgramRow) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const StarIcon = ({ filled }: { filled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        className={filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} />
    </svg>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
         <Input
            type="text"
            placeholder="Search by program name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2"
          />
      </div>
      <div>
        <ProgramCategoryFilter selected={categoryFilter} onChange={setCategoryFilter} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th scope="col" className="py-3.5 pl-4 sm:pl-6 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fav</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => requestSort('programFull')}>Program{getSortIndicator('programFull')}</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => requestSort('waiting')}>People Applied{getSortIndicator('waiting')}</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => requestSort('flptMonths')}>Current Processing Times{getSortIndicator('flptMonths')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
            {paginatedData.map((row) => (
              <tr key={row.program} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <td className="whitespace-nowrap py-4 pl-4 sm:pl-6 pr-3 text-sm">
                  <button onClick={() => toggleFavorite(row.program)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Favorite ${row.programFull}`}>
                    <StarIcon filled={isFavorite(row.program)} />
                  </button>
                </td>
                <td className="whitespace-normal py-4 px-3 text-sm font-medium text-gray-900 dark:text-white">
                  {row.programFull}
                  {row.incompleteReason && <Badge variant="destructive" className="ml-2">Incomplete Data</Badge>}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{row.waitingFormatted || 'N/A'}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 dark:text-gray-300">{formatMonthsYears(row.flptMonths)}</td>
              </tr>
            ))}
          </tbody>
        </table>
         {paginatedData.length === 0 && <p className="text-center p-4 text-gray-500 dark:text-gray-400">No programs match your filters.</p>}
      </div>
       {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgramsTable;