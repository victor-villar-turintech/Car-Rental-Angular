export type BookingExtraPricingType = 'perDay' | 'fixed';

export interface BookingExtra {
  extraId: number;
  name: string;
  description: string;
  price: number;
  pricingType: BookingExtraPricingType;
  category: 'Insurance' | 'Driver' | 'Equipment' | 'Pickup' | 'Support' | 'Fuel';
  selected?: boolean;
}

export interface BookingExtraSelection extends BookingExtra {
  quantity?: number;
  totalPrice?: number;
}
