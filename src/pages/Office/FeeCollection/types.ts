// types.ts 
export interface Student {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    class: string;
    section: string;
    school: {
      _id: string;
      name: string;
    };
    feeDetails: {
      totalFee: number;
      paidFee: number;
      dueDate: string;
    };
  }
  
  export interface FeePayment {
    _id: string;
    studentId: string;
    amountPaid: number;
    paymentMethod: 'cash' | 'upi' | 'card' | 'netbanking';
    transactionId?: string;
    paymentDate: string;
    remarks?: string;
    remainingFee: number;
  }
  
  export interface DueDateExtension {
    _id: string;
    studentId: string;
    previousDueDate: string;
    newDueDate: string;
    reason: string;
    requestDate: string;
  }
  
  export interface PaymentFormData {
    amountPaid: string;
    paymentMethod: string;
    transactionId: string;
    remarks: string;
  }
  
  export interface ExtensionFormData {
    newDueDate: string;
    reason: string;
  }
  
  export interface FilterOptions {
    searchTerm: string;
    class: string;
    section: string;
    dueStatus: 'all' | 'overdue' | 'upcoming';
  }