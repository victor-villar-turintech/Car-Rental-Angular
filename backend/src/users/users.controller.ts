import { Controller, Get, UseGuards, Req, Patch, Param, Body, ForbiddenException } from '@nestjs/common';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

class UpdateUserDto {
  @IsOptional() @IsString() @MaxLength(80) firstName?: string;
  @IsOptional() @IsString() @MaxLength(80) lastName?: string;
  @IsOptional() @IsString() @MaxLength(32) phone?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsInt() rewardPoints?: number;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    const all = await this.usersService.findAll();
    return all.map((u) => this.usersService.toSafe(u));
  }

  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateUserDto) {
    if (req.user.role !== 'admin' && req.user.sub !== id) {
      throw new ForbiddenException('You can only edit your own profile');
    }
    const { active, rewardPoints, ...customerFields } = body;
    const safeBody = req.user.role === 'admin' ? body : customerFields;
    const updated = await this.usersService.update(id, safeBody);
    return this.usersService.toSafe(updated);
  }
}
