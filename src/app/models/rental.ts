export interface Rental {
  rentalId?: number;
  carId: number;
  carName?: string;
  brandName?: string;
  colorName?: string;
  modelYear?: number;
  dailyPrice?: number;
  imagePath?: string;
  rentDate?: Date | string;
  returnDate?: Date | string;
  rentalDays?: number;
  totalRentPrice?: number | undefined;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupLocation?: string;
  status?: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt?: string;
}
