// PaymentSuccess.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your subscription is now active.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-[#033F6A] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#022a47] transition-colors"
          >
            Go to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/study-materials')}
            className="w-full border border-[#033F6A] text-[#033F6A] py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Start Studying
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;