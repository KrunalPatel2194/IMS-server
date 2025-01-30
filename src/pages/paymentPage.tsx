// PaymentPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Lock, CreditCard, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getPackageFeatures } from '../utils/packageUtils';
import axiosInstance from '../utils/axios';
import mastercardLogo from '../assets/mastercard.png';
import visaLogo from '../assets/visa.png';
import amexLogo from '../assets/ame.png';
import LoadingScreen from '../components/Loading';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Package {
  _id: string;
  name: string;
  type: 'content_access' | 'mock_access' | 'full_access';
  price: number;
  mockTestCount: number;
  duration: number;
  description?: string;
}

const CheckoutForm = ({ selectedPackage, onBack }) => {
  const stripe = useStripe();
  const navigate = useNavigate();
  const [showPreparation, setShowPreparation] = useState(false);
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
  
    setLoading(true);
    setError(null);
  
    try {
      const { data } = await axiosInstance.post('/subscriptions/create-payment-intent', {
        packageId: selectedPackage._id
      });
  
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`
            }
          }
        }
      );
  
      if (error) throw new Error(error.message);
  
      if (paymentIntent.status === 'succeeded') {
        // Create subscription
        const subscriptionResponse = await axiosInstance.post('/subscriptions/payment-success', {
          paymentIntentId: paymentIntent.id,
          packageId: selectedPackage._id
        });
  
        if (subscriptionResponse.data.success) {
            setLoading(false);
            setShowPreparation(true);
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };


  return ( <>{showPreparation && (
    <LoadingScreen message="Your study materials are being prepared..." />
  )}
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Secure Payment</h2>
        <Lock className="text-green-600 w-5 h-5" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input 
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input 
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Card Information
          </div>
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#033F6A] text-white py-4 px-4 rounded-lg font-medium 
                 hover:bg-[#022a47] transition-colors flex items-center justify-center gap-2 
                 disabled:opacity-50"
      >
        <Lock className="w-4 h-4" />
        {loading ? 'Processing...' : 'Pay Securely'}
      </button>

      <div className="flex items-center justify-center gap-3 mt-6">
        <img src={visaLogo} alt="Visa" className="h-6" />
        <img src={mastercardLogo} alt="Mastercard" className="h-6" />
        <img src={amexLogo} alt="American Express" className="h-6" />
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-gray-600 flex items-center justify-center gap-2 mt-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Change package
      </button>

      <p className="text-center text-sm text-gray-500">
        Your payment is encrypted and securely processed through <span className="font-semibold">Stripe</span>, a trusted global payment platform.
      </p>
    </form></>
  );
};

const PaymentPage: React.FC = () => {  // Removed PaymentPageProps
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPackage = location.state?.selectedPackage as Package;  // Added type assertion

  // Redirect if no package is selected
  if (!selectedPackage) {
    navigate('/payment-packages');
    return null;
  }

  return (
   
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Package Details - Left Side */}
          <div className="bg-white p-6 rounded-lg shadow-lg h-fit">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Selected Package</h3>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="text-lg font-semibold text-gray-900">{selectedPackage.name}</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">${selectedPackage.price}</span>
                  <span className="text-gray-600 ml-2">/ {selectedPackage.duration} months</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Package Features:</h5>
                  <ul className="space-y-2">
                    {getPackageFeatures(selectedPackage.type).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedPackage.mockTestCount > 0 && (
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-800 mb-2">Additional Benefits:</h5>
                    <div className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="ml-3 text-gray-600">{selectedPackage.mockTestCount} Mock Tests</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500">
                Need help? Contact our support team 24/7
              </p>
            </div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                selectedPackage={selectedPackage}
                onBack={() => navigate('/packages')}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;