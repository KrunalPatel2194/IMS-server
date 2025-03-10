import React from 'react';
import { Search, Plus } from 'lucide-react';

interface SubHeaderProps {
  title: string;
  showSearch?: boolean;
  showSort?: boolean;
  onSearch?: (value: string) => void;
  onSort?: (value: string) => void;
  onCreateNew?: () => void;
}

const SubHeader: React.FC<SubHeaderProps> = ({
  title,
  showSearch = true,
  onSearch,
  onCreateNew
}) => {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-gray-200">
      {/* Left side - Title */}
      <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      
      {/* Right side - Controls */}
      <div className="flex items-center gap-4">
        {/* {showSort && (
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Name
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
              Status
            </button>
          </div>
        )} */}
        
        {showSearch && (
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-4 pr-10 py-1.5 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              onChange={(e) => onSearch?.(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        )}

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#001e3d] text-white text-sm font-medium rounded-md hover:bg-[#0F4868] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>
    </div>
  );
};

export default SubHeader;