export type DiscountCodeType = 'Fixed' | 'Percentage';

export interface DiscountCode {
  code: string;
  description: string;
  type: DiscountCodeType;
  value: number;
  minimumSpend?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  message: string;
  discountAmount: number;
  code?: DiscountCode;
}
