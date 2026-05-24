import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './user.entity';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.users.find({ order: { createdAt: 'DESC' } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async create(data: CreateUserData): Promise<User> {
    const email = data.email.toLowerCase().trim();
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException(`A user already exists with email ${email}`);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.users.create({
      email,
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone || null,
      role: data.role || 'customer',
      rewardPoints: 0,
      active: true,
    });
    return this.users.save(user);
  }

  async update(id: string, patch: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'active' | 'rewardPoints'>>): Promise<User> {
    const user = await this.findByIdOrThrow(id);
    Object.assign(user, patch);
    return this.users.save(user);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  toSafe(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
