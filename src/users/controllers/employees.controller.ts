import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { Roles } from 'src/common/decorator/roles.decorator';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { UserRole } from 'src/common/enums/user-roles.enum';

import { LeaveRequestService } from 'src/leave-request/leave-request.service';
import { AvailabilityService } from 'src/availability/availability.service';

import { CreateAvailabilityDto } from 'src/availability/dto/create-availability.dto';
import { UpdateAvailabilityDto } from 'src/availability/dto/update-availability.dto';

import { CreateLeaveRequestDto } from 'src/leave-request/dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from 'src/leave-request/dto/update-leave-request.dto';

import { CurrentUser } from 'src/common/decorator/current-user.decorator';

import { UsersService } from '../users.service';

@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.EMPLOYEE,
  UserRole.NEW_HIRE,
  UserRole.TRAINEE,
  UserRole.ASSISTANT_MANAGER,
)
export class EmployeeController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly usersService: UsersService,
  ) {}

  // =====================================================
  // AVAILABILITIES
  // =====================================================

  @Post('availability')
  createAvailability(
    @CurrentUser('id') userId: number,
    @Body() body: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createAvailability(
      userId,
      body,
    );
  }

  @Get('availability')
  getMyAvailability(
    @CurrentUser('id') userId: number,
  ) {
    return this.availabilityService.getUserAvailabilites(
      userId,
    );
  }

  @Patch('availability/:id')
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAvailabilityDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.availabilityService.updateAvailability(
      id,
      body,
      userId,
    );
  }

  @Delete('availability/:id')
  deleteAvailability(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.availabilityService.deleteAvailability(
      id,
      userId,
    );
  }

  // =====================================================
  // LEAVE REQUESTS
  // =====================================================

  @Post('leave-request')
  createLeaveRequest(
    @CurrentUser('id') userId: number,
    @Body() body: CreateLeaveRequestDto,
  ) {
    return this.leaveRequestService.createLeaveRequest(
      userId,
      body,
    );
  }

  @Get('leave-request')
  getLeaveRequests(
    @CurrentUser('id') userId: number,
  ) {
    return this.leaveRequestService.getUserLeaveRequests(
      userId,
    );
  }

  @Patch('leave-request/:id')
  updateLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeaveRequestDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.leaveRequestService.updateLeaveRequest(
      id,
      body,
      userId,
    );
  }

  @Delete('leave-request/:id')
  deleteLeaveRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.leaveRequestService.deleteLeaveRequest(
      id,
      userId,
    );
  }

  // =====================================================
  // TIME TRACKING / PUNCH
  // =====================================================

  @Post('check-in')
  checkIn(
    @CurrentUser('id') userId: number,
  ) {
    return this.usersService.checkIn(userId);
  }

  @Post('check-out')
  checkOut(
    @CurrentUser('id') userId: number,
  ) {
    return this.usersService.checkOut(userId);
  }

  @Get('check-status')
  checkStatus(
    @CurrentUser('id') userId: number,
  ) {
    return this.usersService.checkStatus(userId);
  }
}