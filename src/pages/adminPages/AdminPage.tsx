import React, { useState } from 'react';
import SubHeader from '../../components/common/SubHeader';
import PaginatedTable from '../../components/common/PaginatedTable';
import Details from '../../components/common/Details';
import axiosInstance from '../../utils/axios';

interface Admin {
  id: string;
  name: string;
  email: string;
  type: string;
  status: 'Active' | 'Inactive';
}

const AdminPage = () => {
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleEdit = (admin: Admin) => {
    setIsCreating(false);
    setSelectedAdmin(admin);
    setShowDetails(true);
  };

  const handleDelete = (admin: Admin) => {
    // Handle delete logic
    console.log('Delete:', admin);
  };

  const handleUpdate = async (data: any) => {
    try {
      const response = await axiosInstance.put(`/admin/update/${selectedAdmin?.id}`, {
        name: data.name,
        email: data.email,
        status: data.status,
      });

      if (response.data) {
        showSuccessMessage('Admin updated successfully!');
        setLastUpdatedId(selectedAdmin?.id || null);
        setTimeout(() => setLastUpdatedId(null), 5000);
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Failed to update admin');
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const response = await axiosInstance.post('/admin/create-admins', {
        name: data.name,
        email: data.email,
        status: data.status,
      });

      if (response.data) {
        showSuccessMessage('Admin created successfully!');
        setSelectedAdmin(null);
        setIsCreating(false);
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin');
    }
  };

  const handleCreateNew = () => {
    setSelectedAdmin(null);
    setIsCreating(true);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6 relative">
      {successMessage && (
        <div className="absolute top-0 right-0 m-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg">
          {successMessage}
        </div>
      )}

      <SubHeader 
        title="Admins" 
        onSearch={(value) => console.log('Search:', value)}
        onCreateNew={handleCreateNew}
      />

      <div className="flex gap-6">
        <div className="flex-1">
          <PaginatedTable
            itemsPerPage={5}
            onEdit={handleEdit}
            onDelete={handleDelete}
            lastUpdatedId={lastUpdatedId}
          />
        </div>

        <div className="w-80">
          {showDetails ? (
            <Details
              title={isCreating ? "CREATE ADMIN" : "ADMIN DETAILS"}
              data={{
                name: selectedAdmin?.name || '',
                email: selectedAdmin?.email || '',
                status: selectedAdmin?.status || '',
              }}
              onUpdate={handleUpdate}
              onCreate={handleCreate}
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              onCancel={() => {
                setShowDetails(false);
                setIsCreating(false);
                setSelectedAdmin(null);
              }}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-center justify-center text-gray-500">
              Select an admin to view details or click "Create New"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;