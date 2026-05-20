export type BookingExtraPricingType = 'perDay' | 'fixed';
export type BookingExtraCategory = 'Insurance' | 'Driver' | 'Equipment' | 'Pickup' | 'Support' | 'Fuel' | 'Other';

export interface BookingExtra {
  extraId: number;
  name: string;
  description: string;
  price: number;
  pricingType: BookingExtraPricingType;
  category: BookingExtraCategory;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  selected?: boolean;
}

export interface BookingExtraSelection extends BookingExtra {
  quantity?: number;
  totalPrice?: number;
}
