import { BookingExtraSelection } from './booking-extra';
import { PaymentMethod, PaymentStatus } from './payment';

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
  vehicleSubtotal?: number;
  extrasTotal?: number;
  totalRentPrice?: number | undefined;
  selectedExtras?: BookingExtraSelection[];
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  pickupLocation?: string;
  pickupLocationId?: string;
  airportTerminal?: string;
  status?: RentalStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
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
