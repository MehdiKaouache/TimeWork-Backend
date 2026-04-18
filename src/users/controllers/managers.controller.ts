import { Controller, Get, Patch, ParseIntPipe, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from '../users.service';
import { AvailabilityService } from 'src/availability/availability.service';
import { LeaveRequestService } from 'src/leave-request/leave-request.service';
import { SetUserRoleSalaryDTO } from '../dtos/set-user-role-salary.dto';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('managers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
export class ManagersController {

    constructor(
        private readonly userService: UsersService,
        private readonly leaveService: LeaveRequestService,
        private readonly availabilityService: AvailabilityService
    ) {}

    @Get('users')
    getAllUsers() {
        return this.userService.findAll();
    }

    @Get("users/pending")
    async getAllUsersPendingApprouval(){
        const users = await this.userService.findAll()

        return users.filter(user => user.status === "pending");
    }

    @Patch('users/:id/approve')
    approveUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.approveUser(id);
    }
    
    @Patch('users/:id/reject')
    rejectUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.rejectUser(id);
    }

    @Patch('users/:id/role-salary')
    setRoleAndHourlyRate(@Param('id', ParseIntPipe) id: number, @Body() body: SetUserRoleSalaryDTO) {
        return this.userService.setUserRoleAndHourlyRate(id, body);
    }

    @Get('leave-requests')
    getAllLeaveRequests() {
        return this.leaveService.getAllLeaveRequests();
    }

    @Get('leave-requests/:userId')
    getUserLeaveRequests(@Param('userId', ParseIntPipe) userId: number) {
        return this.leaveService.getUserLeaveRequests(userId);
    }

    @Patch('leave-requests/:id/approve')
    approveLeaveRequest(@Param('id', ParseIntPipe) id: number) {
        return this.leaveService.approveLeaveRequest(id);
    }

    @Patch('leave-requests/:id/reject')
    rejectLeaveRequest(@Param('id', ParseIntPipe) id: number) {
        return this.leaveService.rejectLeaveRequest(id);
    }

    @Get('availabilities')
    getAllAvailabilities() {
        return this.availabilityService.getAllAvailabilities();
    }

    @Get('availabilities/:userId')
    getUserAvailabilities(@Param('userId', ParseIntPipe) userId: number) {
        return this.availabilityService.getUserAvailabilites(userId);
    }
}


