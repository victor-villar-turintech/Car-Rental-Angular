import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 191 })
  customerEmail: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  customerId: string | null;

  @Column({ type: 'varchar', length: 191 })
  carId: string;

  @Column({ type: 'varchar', length: 120 })
  carLabel: string;

  @Column({ type: 'varchar', length: 80 })
  pickupBranch: string;

  @Column({ type: 'varchar', length: 80 })
  dropoffBranch: string;

  @Column({ type: 'varchar', length: 32 })
  pickupDate: string;

  @Column({ type: 'varchar', length: 32 })
  returnDate: string;

  @Column({ type: 'real' })
  totalPrice: number;

  @Column({ type: 'varchar', length: 32, default: 'Pending' })
  status: BookingStatus;

  @Column({ type: 'varchar', length: 32, default: 'Card' })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 32, default: 'Paid' })
  paymentStatus: string;

  @Column({ type: 'text', nullable: true })
  extrasJson: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
