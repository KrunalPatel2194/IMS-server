import React from 'react';
import { X } from 'lucide-react';
import { DueDateExtension } from './types';

interface ExtensionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  extensions: DueDateExtension[];
  studentName: string;
}

const ExtensionHistoryModal: React.FC<ExtensionHistoryModalProps> = ({
  isOpen,
  onClose,
  extensions,
  studentName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg w-full max-w-3xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Due Date Extensions - {studentName}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">New Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {extensions.map((extension) => (
                    <tr key={extension._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(extension.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(extension.previousDueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(extension.newDueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {extension.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {extensions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No extension records found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionHistoryModal;