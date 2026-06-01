import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, CreateUserData } from '../users/users.service';
import { User } from '../users/user.entity';

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const matches = await this.usersService.verifyPassword(user, password);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueToken(user);
  }

  async register(data: CreateUserData): Promise<AuthResponse> {
    const user = await this.usersService.create({ ...data, role: 'customer' });
    return this.issueToken(user);
  }

  private issueToken(user: User): AuthResponse {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return { token, user: this.usersService.toSafe(user) };
  }
}
