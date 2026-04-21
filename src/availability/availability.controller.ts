import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  
  @Get()
  @Roles(UserRole.MANAGER)
  findAll() {
    return this.availabilityService.getAllAvailabilities();
  }
  
  @Get('users/:userId')
  findOne(@Param('userId', ParseIntPipe) userId: number) {
    return this.availabilityService.getUserAvailabilites(userId);
  }

  @Post('users/:userId')
  create(@Param('userId', ParseIntPipe) userId: number, 
    @Body() body: CreateAvailabilityDto) {
    return this.availabilityService.createAvailability(userId, body);
  }

  @Patch(':id')
  @Roles(UserRole.EMPLOYEE)
  update(@Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAvailabilityDto) {
    return this.availabilityService.updateAvailability(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.EMPLOYEE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.availabilityService.deleteAvailability(id);
  }
}
