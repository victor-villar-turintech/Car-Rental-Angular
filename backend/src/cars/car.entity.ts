import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  modelName: string;

  @Column({ type: 'varchar', length: 80 })
  brandName: string;

  @Column({ type: 'varchar', length: 40 })
  colorName: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  seats: number;

  @Column({ type: 'integer' })
  bags: number;

  @Column({ type: 'varchar', length: 40 })
  fuelType: string;

  @Column({ type: 'varchar', length: 40 })
  transmission: string;

  @Column({ type: 'real' })
  baseDailyPrice: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
