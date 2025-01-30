import React, { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  header: string;
}

interface PaginatedTableProps {
  itemsPerPage?: number;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  lastUpdatedId?: string | null;
  data?: any[];
  columns: Column[];
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  itemsPerPage = 5,
  onEdit,
  onDelete,
  lastUpdatedId,
  data = [], // Provide default empty array
  columns
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.max(1, Math.ceil((data?.length || 0) / itemsPerPage));
  
  const currentData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [currentPage, itemsPerPage, data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {column.header}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((item) => (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-50 transition-colors duration-300
                  ${lastUpdatedId === item.id ? 'bg-green-50' : ''}
                `}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.key === 'status' ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${item[column.key] === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                        }`}>
                        {item[column.key]}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">{item[column.key]}</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEdit?.(item)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete?.(item)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
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
      </div>
    </div>
  );
};

export default PaginatedTable;