import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car } from './car.entity';

@Injectable()
export class CarsService {
  constructor(@InjectRepository(Car) private readonly cars: Repository<Car>) {}

  findAll(): Promise<Car[]> {
    return this.cars.find({ order: { brandName: 'ASC', modelName: 'ASC' } });
  }

  async findOne(id: string): Promise<Car> {
    const car = await this.cars.findOne({ where: { id } });
    if (!car) {
      throw new NotFoundException(`Car ${id} not found`);
    }
    return car;
  }

  create(data: Partial<Car>): Promise<Car> {
    return this.cars.save(this.cars.create(data));
  }

  async update(id: string, patch: Partial<Car>): Promise<Car> {
    const car = await this.findOne(id);
    Object.assign(car, patch);
    return this.cars.save(car);
  }

  async remove(id: string): Promise<void> {
    const car = await this.findOne(id);
    await this.cars.remove(car);
  }
}
