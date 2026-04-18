import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dtos/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dtos/update-leave-request.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Controller('leave-request')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}
  
  @Get()
  @Roles(UserRole.MANAGER)
  findAll() {
    return this.leaveRequestService.getAllLeaveRequests();
  }

  @Get('user/:userId')
  findOne(@Param('userId', ParseIntPipe) userId: number) {
    return this.leaveRequestService.getUserLeaveRequests(userId);
  }

  @Post('user/:userId')
  @Roles(UserRole.EMPLOYEE)
  create(@Param('userId', ParseIntPipe) userId: number, 
    @Body() body: CreateLeaveRequestDto) {
    return this.leaveRequestService.createLeaveRequest(userId, body);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateLeaveRequestDto) {
    return this.leaveRequestService.updateLeaveRequest(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.deleteLeaveRequest(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.MANAGER)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.approveLeaveRequest(id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.MANAGER)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.leaveRequestService.rejectLeaveRequest(id);
  }
}
