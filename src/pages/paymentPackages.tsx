// PaymentPackages.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import axiosInstance from '../utils/axios';
import { Check } from 'lucide-react';
import { getPackageFeatures } from '../utils/packageUtils';
interface Package {
  _id: string;
  name: string;
  type: 'content_only' | 'mock_access' | 'full_access';
  price: number;
  mockTestCount: number;
  duration: number;
  description?: string;
}

const PaymentPackages: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const handlePackageSelect = (pkg) => {
    navigate('/payment', { state: { selectedPackage: pkg } });
  };
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const examResponse = await axiosInstance.get(
          `/exams/byFieldAndExam/${encodeURIComponent(user?.fieldOfStudy || '')}/${encodeURIComponent(user?.selectedExam || '')}`
        );
        
        if (examResponse.data && examResponse.data.examId) {
          const packagesResponse = await axiosInstance.get(`/subscriptions/packages/exam/${examResponse.data.examId}`);
          setPackages(packagesResponse.data);
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load subscription packages');
      } finally {
        setLoading(false);
      }
    };

    if (user?.fieldOfStudy && user?.selectedExam) {
      fetchPackages();
    }
  }, [user]);
  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#033F6A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <h3 className="font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Study Package</h2>
          <p className="mt-4 text-xl text-gray-600">
            Select the package that best fits your preparation needs for {user?.selectedExam}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-lg transition-shadow"
            >
              {pkg.type === 'full_access' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#033F6A] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">${pkg.price}</span>
                  <span className="text-gray-500 ml-2">/ {pkg.duration} months</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4 flex-1">
                {getPackageFeatures(pkg.type).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
                {pkg.mockTestCount > 0 && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="ml-3 text-gray-700">{pkg.mockTestCount} Mock Tests</span>
                  </li>
                )}
              </ul>

              <button
                onClick={() => handlePackageSelect(pkg)}
                className="w-full bg-[#033F6A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#022a47] transition-colors"
              >
                Select Package
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            All packages include access to basic features and community support
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPackages;