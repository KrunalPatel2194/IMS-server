import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-1 mt-6">
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            w-8 h-8 flex items-center justify-center rounded
            text-sm font-medium transition-colors
            ${currentPage === page 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;