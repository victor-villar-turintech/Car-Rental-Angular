import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CarsService } from './cars.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CarPayload {
  @IsString() @MaxLength(120) modelName: string;
  @IsString() @MaxLength(80) brandName: string;
  @IsString() @MaxLength(40) colorName: string;
  @IsInt() @Min(1900) year: number;
  @IsInt() @Min(1) seats: number;
  @IsInt() @Min(0) bags: number;
  @IsString() @MaxLength(40) fuelType: string;
  @IsString() @MaxLength(40) transmission: string;
  @IsNumber() @Min(0) baseDailyPrice: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
}

class CarPatchPayload {
  @IsOptional() @IsString() @MaxLength(120) modelName?: string;
  @IsOptional() @IsString() @MaxLength(80) brandName?: string;
  @IsOptional() @IsString() @MaxLength(40) colorName?: string;
  @IsOptional() @IsInt() @Min(1900) year?: number;
  @IsOptional() @IsInt() @Min(1) seats?: number;
  @IsOptional() @IsInt() @Min(0) bags?: number;
  @IsOptional() @IsString() @MaxLength(40) fuelType?: string;
  @IsOptional() @IsString() @MaxLength(40) transmission?: string;
  @IsOptional() @IsNumber() @Min(0) baseDailyPrice?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
}

@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  list() {
    return this.carsService.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() body: CarPayload) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.carsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Req() req: any, @Param('id') id: string, @Body() body: CarPatchPayload) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return this.carsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    await this.carsService.remove(id);
    return { success: true };
  }
}
