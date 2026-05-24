import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { CarsService } from './cars/cars.service';

const DEFAULT_CARS = [
  { brandName: 'BMW', modelName: 'Picanto', colorName: 'White', year: 2023, seats: 5, bags: 2, fuelType: 'Petrol', transmission: 'Automatic', baseDailyPrice: 49.99, description: 'Compact city car.' },
  { brandName: 'BMW', modelName: 'X3', colorName: 'Black', year: 2023, seats: 5, bags: 4, fuelType: 'Diesel', transmission: 'Automatic', baseDailyPrice: 89.99, description: 'Mid-size SUV.' },
  { brandName: 'Audi', modelName: 'A4', colorName: 'Grey', year: 2024, seats: 5, bags: 3, fuelType: 'Petrol', transmission: 'Automatic', baseDailyPrice: 79.99, description: 'Executive sedan.' },
  { brandName: 'Mercedes', modelName: 'C-Class', colorName: 'Silver', year: 2024, seats: 5, bags: 3, fuelType: 'Hybrid', transmission: 'Automatic', baseDailyPrice: 99.99, description: 'Premium sedan.' },
  { brandName: 'Toyota', modelName: 'Corolla', colorName: 'Blue', year: 2023, seats: 5, bags: 2, fuelType: 'Hybrid', transmission: 'Automatic', baseDailyPrice: 54.99, description: 'Reliable compact.' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const users = app.get(UsersService);
  const cars = app.get(CarsService);

  const adminExisting = await users.findByEmail('admin@rentacar.local');
  if (!adminExisting) {
    await users.create({
      email: 'admin@rentacar.local',
      password: 'admin123',
      firstName: 'Site',
      lastName: 'Admin',
      role: 'admin',
    });
    Logger.log('Seeded admin user (admin@rentacar.local / admin123)', 'Seed');
  } else {
    Logger.log('Admin user already exists, skipping', 'Seed');
  }

  const demoExisting = await users.findByEmail('demo@rentacar.local');
  if (!demoExisting) {
    await users.create({
      email: 'demo@rentacar.local',
      password: 'demo1234',
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'customer',
    });
    Logger.log('Seeded demo customer (demo@rentacar.local / demo1234)', 'Seed');
  }

  const carCount = (await cars.findAll()).length;
  if (carCount === 0) {
    for (const car of DEFAULT_CARS) {
      await cars.create(car);
    }
    Logger.log(`Seeded ${DEFAULT_CARS.length} demo cars`, 'Seed');
  } else {
    Logger.log(`${carCount} cars already exist, skipping`, 'Seed');
  }

  await app.close();
}

bootstrap()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
