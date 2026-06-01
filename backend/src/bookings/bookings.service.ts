import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';

export interface CreateBookingData {
  customerEmail: string;
  customerId?: string | null;
  carId: string;
  carLabel: string;
  pickupBranch: string;
  dropoffBranch: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  paymentMethod?: string;
  paymentStatus?: string;
  extras?: unknown;
}

@Injectable()
export class BookingsService {
  constructor(@InjectRepository(Booking) private readonly bookings: Repository<Booking>) {}

  findForCustomer(email: string): Promise<Booking[]> {
    return this.bookings.find({ where: { customerEmail: email.toLowerCase() }, order: { createdAt: 'DESC' } });
  }

  findAll(): Promise<Booking[]> {
    return this.bookings.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
  }

  create(data: CreateBookingData): Promise<Booking> {
    const booking = this.bookings.create({
      customerEmail: data.customerEmail.toLowerCase(),
      customerId: data.customerId || null,
      carId: data.carId,
      carLabel: data.carLabel,
      pickupBranch: data.pickupBranch,
      dropoffBranch: data.dropoffBranch,
      pickupDate: data.pickupDate,
      returnDate: data.returnDate,
      totalPrice: data.totalPrice,
      status: 'Confirmed',
      paymentMethod: data.paymentMethod || 'Card',
      paymentStatus: data.paymentStatus || 'Paid',
      extrasJson: data.extras ? JSON.stringify(data.extras) : null,
    });
    return this.bookings.save(booking);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = status;
    return this.bookings.save(booking);
  }
}
