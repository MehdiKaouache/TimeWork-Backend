import { Controller, Param, ParseIntPipe, Post, UseGuards, Body, Get, Patch, Delete } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { LeaveRequestService } from 'src/leave-request/leave-request.service';
import { AvailabilityService } from 'src/availability/availability.service';
import { CreateAvailabilityDto } from 'src/availability/dtos/create-availability.dto';
import { UserListDto } from '../dtos/user-list.dto';
import { UpdateAvailabilityDto } from 'src/availability/dtos/update-availability.dto';
import { CreateLeaveRequestDto } from 'src/leave-request/dtos/create-leave-request.dto';
import { UpdateLeaveRequestDto } from 'src/leave-request/dtos/update-leave-request.dto';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';

@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE)
export class EmployeeController {

    constructor(
        private readonly availabilityService: AvailabilityService,
        private readonly leaveRequestService: LeaveRequestService
    ) {}

    @Post('availability/:userId')
    createAvailability(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: CreateAvailabilityDto
    ) {
        return this.availabilityService.createAvailability(userId, body);
    }

    @Get('availability/:userId')
    getAvailability(
        @Param('userId', ParseIntPipe) userId: number
    ) {
        return this.availabilityService.getUserAvailabilites(userId);
    }

    @Patch('availability/:id')
    updateAvailability(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateAvailabilityDto
    ) {
        return this.availabilityService.updateAvailability(id, body);
    }

    @Delete('availability/:id')
    deleteAvailability(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.availabilityService.deleteAvailability(id);
    }

    @Post('leave-request/:userId')
    createLeaveRequest(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: CreateLeaveRequestDto
    ) {
        return this.leaveRequestService.createLeaveRequest(userId, body);
    }

    @Get('leave-request/:userId')
    getLeaveRequests(
        @Param('userId', ParseIntPipe) userId: number
    ) {
        return this.leaveRequestService.getUserLeaveRequests(userId);
    }

    @Patch('leave-request/:id')
    updateLeaveRequest(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateLeaveRequestDto
    ) {
        return this.leaveRequestService.updateLeaveRequest(id, body);
    }


    @Delete('leave-request/:id')
    deleteLeaveRequest(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.leaveRequestService.deleteLeaveRequest(id);
    }
}
