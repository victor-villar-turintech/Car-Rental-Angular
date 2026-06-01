import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BookingStatus } from './booking.entity';

class CreateBookingDto {
  @IsString() @MaxLength(191) carId: string;
  @IsString() @MaxLength(120) carLabel: string;
  @IsString() @MaxLength(80) pickupBranch: string;
  @IsString() @MaxLength(80) dropoffBranch: string;
  @IsString() @MaxLength(32) pickupDate: string;
  @IsString() @MaxLength(32) returnDate: string;
  @IsNumber() @Min(0) totalPrice: number;
  @IsOptional() @IsString() @MaxLength(32) paymentMethod?: string;
  @IsOptional() @IsString() @MaxLength(32) paymentStatus?: string;
  @IsOptional() extras?: unknown;
}

class UpdateBookingStatusDto {
  @IsIn(['Pending', 'Confirmed', 'Cancelled', 'Completed']) status: BookingStatus;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async list(@Req() req: any) {
    if (req.user.role === 'admin') {
      return this.bookingsService.findAll();
    }
    return this.bookingsService.findForCustomer(req.user.email);
  }

  @Get(':id')
  async getOne(@Req() req: any, @Param('id') id: string) {
    const booking = await this.bookingsService.findOne(id);
    if (req.user.role !== 'admin' && booking.customerEmail !== req.user.email.toLowerCase()) {
      throw new ForbiddenException('You can only view your own bookings');
    }
    return booking;
  }

  @Post()
  create(@Req() req: any, @Body() body: CreateBookingDto) {
    return this.bookingsService.create({
      customerEmail: req.user.email,
      customerId: req.user.sub,
      ...body,
    });
  }

  @Patch(':id/status')
  async updateStatus(@Req() req: any, @Param('id') id: string, @Body() body: UpdateBookingStatusDto) {
    const booking = await this.bookingsService.findOne(id);
    if (req.user.role !== 'admin' && booking.customerEmail !== req.user.email.toLowerCase()) {
      throw new ForbiddenException('You can only update your own bookings');
    }
    if (req.user.role !== 'admin' && body.status !== 'Cancelled') {
      throw new ForbiddenException('Customers can only cancel their bookings');
    }
    return this.bookingsService.updateStatus(id, body.status);
  }
}
