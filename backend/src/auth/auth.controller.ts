import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(1) password: string;
}

class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(80) password: string;
  @IsString() @MinLength(1) @MaxLength(80) firstName: string;
  @IsString() @MinLength(1) @MaxLength(80) lastName: string;
  @IsOptional() @IsString() @MaxLength(32) phone?: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user = await this.usersService.findByIdOrThrow(req.user.sub);
    return this.usersService.toSafe(user);
  }
}
