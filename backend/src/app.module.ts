import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/bookings.module';
import { User } from './users/user.entity';
import { Car } from './cars/car.entity';
import { Booking } from './bookings/booking.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.SQLITE_PATH || join(__dirname, '..', 'data', 'rentacar.sqlite'),
      entities: [User, Car, Booking],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production' ? ['error'] : false,
    }),
    AuthModule,
    UsersModule,
    CarsModule,
    BookingsModule,
  ],
})
export class AppModule {}
