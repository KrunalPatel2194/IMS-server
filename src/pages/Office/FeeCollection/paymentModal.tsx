import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, IndianRupee, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
  maxAmount: number;
  studentName: string;
}

const PAYMENT_METHODS = {
  cash: {
    label: 'Cash',
    charges: 0,
    icon: IndianRupee,
  },
  upi: {
    label: 'UPI',
    charges: 0,
    icon: Smartphone,
    providers: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'],
  },
  card: {
    label: 'Card',
    charges: 2, // 2% charges
    icon: CreditCard,
    types: ['Credit Card', 'Debit Card'],
  },
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
  studentName,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'cash',
    cardType: '',
    upiProvider: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
    remarks: '',
  });

  const [charges, setCharges] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    calculateCharges();
  }, [formData.amount, formData.paymentMethod]);

  const calculateCharges = () => {
    const amount = parseFloat(formData.amount) || 0;
    let chargePercentage = 0;

    if (formData.paymentMethod === 'card') {
      chargePercentage = PAYMENT_METHODS.card.charges;
    }

    const calculatedCharges = (amount * chargePercentage) / 100;
    setCharges(calculatedCharges);
    setTotalAmount(amount + calculatedCharges);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) > maxAmount) {
      newErrors.amount = 'Amount exceeds the due balance';
    }

    if (formData.paymentMethod === 'card') {
      if (!formData.cardType) {
        newErrors.cardType = 'Card type is required';
      }
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.cardNumber)) {
        newErrors.cardNumber = 'Invalid card number';
      }
      if (!formData.cardExpiry) {
        newErrors.cardExpiry = 'Expiry date is required';
      }
      if (!formData.cardCvv) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3}$/.test(formData.cardCvv)) {
        newErrors.cardCvv = 'Invalid CVV';
      }
    }

    if (formData.paymentMethod === 'upi') {
      if (!formData.upiProvider) {
        newErrors.upiProvider = 'UPI provider is required';
      }
      if (!formData.upiId) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!formData.upiId.includes('@')) {
        newErrors.upiId = 'Invalid UPI ID';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        charges,
        totalAmount,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Process Payment</h3>
              <p className="text-sm text-gray-500">for {studentName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="pl-7 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    max={maxAmount}
                    step="0.01"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(PAYMENT_METHODS).map(([method, details]) => {
                    const Icon = details.icon;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setFormData({...formData, paymentMethod: method})}
                        className={`flex flex-col items-center justify-center p-3 border rounded-lg ${
                          formData.paymentMethod === method
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <Icon className="w-6 h-6 mb-1" />
                        <span className="text-sm">{details.label}</span>
                        {details.charges > 0 && (
                          <span className="text-xs text-gray-500">{details.charges}% charges</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Type</label>
                    <select
                      value={formData.cardType}
                      onChange={(e) => setFormData({...formData, cardType: e.target.value})}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                    >
                      <option value="">Select Card Type</option>
                      {PAYMENT_METHODS.card.types.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.cardType && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardType}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Number</label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                        maxLength={16}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CVV</label>
                      <input
                        type="password"
                        value={formData.cardCvv}
                        onChange={(e) => setFormData({...formData, cardCvv: e.target.value})}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                        maxLength={3}
                      />
                      {errors.cardCvv && (
                        <p className="mt-1 text-sm text-red-600">{errors.cardCvv}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="month"
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({...formData, cardExpiry: e.target.value})}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                    />
                    {errors.cardExpiry && (
                      <p className="mt-1 text-sm text-red-600">{errors.cardExpiry}</p>
                    )}
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UPI Provider</label>
                    <select
                      value={formData.upiProvider}
                      onChange={(e) => setFormData({...formData, upiProvider: e.target.value})}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                    >
                      <option value="">Select UPI Provider</option>
                      {PAYMENT_METHODS.upi.providers.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                    {errors.upiProvider && (
                      <p className="mt-1 text-sm text-red-600">{errors.upiProvider}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">UPI ID</label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({...formData, upiId: e.target.value})}
                      className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                      placeholder="example@upi"
                    />
                    {errors.upiId && (
                      <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                  rows={2}
                  className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
                />
              </div>

              {charges > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span>₹{parseFloat(formData.amount || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Charges ({PAYMENT_METHODS[formData.paymentMethod as keyof typeof PAYMENT_METHODS].charges}%):</span>
                    <span>₹{charges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;