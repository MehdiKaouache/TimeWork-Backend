import { UsersService } from '../users.service';
import { AvailabilityService } from 'src/availability/availability.service';
import { LeaveRequestService } from 'src/leave-request/leave-request.service';
import { SetUserRoleSalaryDTO } from '../dto/set-user-role-salary.dto';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from '../entity/user.entity';

import { 
    Controller, 
    Get, 
    Patch, 
    ParseIntPipe, 
    Param, 
    Body, 
    UseGuards, 
    ClassSerializerInterceptor, 
    UseInterceptors, 
    BadRequestException
} from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('managers')
export class ManagersController {

    constructor(
        private readonly userService: UsersService,
        private readonly leaveService: LeaveRequestService,
        private readonly availabilityService: AvailabilityService
    ) {}

    // --- Gestion des Utilisateurs --- //

    @Get('users')
    getAllUsers() {
        return this.userService.findAll();
    }

    @Get('users/pending')
    async getAllUsersPendingApprouval(){
        const users = await this.userService.findPendingUsers()

        return users;
    }

    @Get('users/approved')
    async getAllUsersApproved(){
        const users = await this.userService.findAllApproved()

        return users;
    }

    @Get('users/rejected')
    async getAllUsersRejected(){
        const users = await this.userService.findAllRejected()

        return users;
    }

    @Get('users/active')
    async getAllUsersActive(){
        const users = await this.userService.findAllActive()

        return users;
    }

    @Get('users/deactivated')
    async getAllUsersDeactivated(){
        const users = await this.userService.findAllDeactivated()

        return users;
    }

    @Patch('users/:id/approve')
    approveUser(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() manager: User
    ) {
        return this.userService.approveUser(id, manager);
    }
    
    @Patch('users/:id/reject')
    rejectUser(@Param('id', ParseIntPipe) id: number) {
        return this.userService.rejectUser(id);
    }

    @Patch('users/:id/role-salary')
    setRoleAndHourlyRate(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: SetUserRoleSalaryDTO,
        @CurrentUser() manager: User
    ) {
        if (id === manager.id) {
            throw new BadRequestException('You can not change your own salary or role.');
        }

        return this.userService.setUserRoleAndHourlyRate(id, body);
    }

    // --- Gestion des Congés (Leave Requests) --- //

    @Get('leave-requests')
    getAllLeaveRequests() {
        return this.leaveService.getAllLeaveRequests();
    }

    @Get('leave-requests/user/:userId')
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

    // --- Gestion des Disponibilités (Availabilities) --- //

    @Get('availabilities')
    getAllAvailabilities() {
        return this.availabilityService.getAllAvailabilities();
    }

    @Get('availabilities/user/:userId')
    getUserAvailabilities(@Param('userId', ParseIntPipe) userId: number) {
        return this.availabilityService.getUserAvailabilites(userId);
    }
}