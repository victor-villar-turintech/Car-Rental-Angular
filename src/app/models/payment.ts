export type PaymentMethod = 'Card' | 'PayPal' | 'ApplePay';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Payment {
  paymentId?: number;
  bookingReference: string;
  method: PaymentMethod;
  amount: number;
  grossAmount?: number;
  discountCode?: string;
  discountAmount?: number;
  rewardDiscountAmount?: number;
  currency: 'GBP';
  status: PaymentStatus;
  transactionReference: string;
  cardholderName?: string;
  cardLastFour?: string;
  billingPostcode?: string;
  createdAt: string;
  updatedAt?: string;
}
