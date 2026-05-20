export type RentalStatus = 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';

export interface Rental {
  rentalId?: number;
  bookingReference?: string;
  carId: number;
  carName?: string;
  brandName?: string;
  colorName?: string;
  modelYear?: number;
  dailyPrice?: number;
  imagePath?: string;
  numberPlate?: string;
  rentDate?: Date | string;
  returnDate?: Date | string;
  rentalDays?: number;
  totalRentPrice?: number | undefined;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupLocation?: string;
  status?: RentalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentalMetrics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  projectedRevenue: number;
  completedRevenue: number;
  unavailableCarsToday: number;
  mostBookedBrand: string;
}
