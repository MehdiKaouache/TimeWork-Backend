import { Controller, Param, ParseIntPipe, Post, UseGuards, Body, Get, Patch, Delete } from '@nestjs/common';
import { Roles } from 'src/common/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { LeaveRequestService } from 'src/leave-request/leave-request.service';
import { AvailabilityService } from 'src/availability/availability.service';
import { CreateAvailabilityDto } from 'src/availability/dto/create-availability.dto';
import { UpdateAvailabilityDto } from 'src/availability/dto/update-availability.dto';
import { CreateLeaveRequestDto } from 'src/leave-request/dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from 'src/leave-request/dto/update-leave-request.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@Controller('employee')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.EMPLOYEE)
export class EmployeeController {

    constructor(
        private readonly availabilityService: AvailabilityService,
        private readonly leaveRequestService: LeaveRequestService
    ) {}

    // --- Availabilities --- //

    @Post('availability')
    createAvailability(
        @CurrentUser('id') userId: number, 
        @Body() body: CreateAvailabilityDto
    ) {
        return this.availabilityService.createAvailability(userId, body);
    }

    @Get('availability')
    getMyAvailability(@CurrentUser('id') userId: number) {
        return this.availabilityService.getUserAvailabilites(userId);
    }

    @Delete('availability/:id')
    deleteAvailability(
        @Param('id', ParseIntPipe) id: number, 
        @CurrentUser('id') userId: number
    ) {
        // On passe userId pour vérifier que la ressource lui appartient
        return this.availabilityService.deleteAvailability(id, userId);
    }

    @Patch('availability/:id')
    updateAvailability(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateAvailabilityDto,
        @CurrentUser('id') userId: number
    ) {
        // Idem ici
        return this.availabilityService.updateAvailability(id, userId, body);
    }

    // --- Leave Requests --- //

    @Post('leave-request')
    createLeaveRequest(
        @CurrentUser('id') userId: number, 
        @Body() body: CreateLeaveRequestDto
    ) {
        return this.leaveRequestService.createLeaveRequest(userId, body);
    }

    @Get('leave-request')
    getLeaveRequests(@CurrentUser('id') userId: number) {
        // CORRECTION : On utilise le userId du token, pas un @Param inexistant
        return this.leaveRequestService.getUserLeaveRequests(userId);
    }

    @Delete('leave-request/:id')
    deleteLeaveRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number
    ) {
        // On passe userId pour vérifier que la ressource lui appartient
        return this.leaveRequestService.deleteLeaveRequest(id, userId);
    }

    @Patch('leave-request/:id')
    updateLeaveRequest(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
        @Body() body: UpdateLeaveRequestDto
    ) {
        // Idem ici
        return this.leaveRequestService.updateLeaveRequest(id, userId, body);
    }
}