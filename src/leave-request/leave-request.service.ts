import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { LeaveRequest } from './entity/leave-request.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';
import { LeaveStatus } from 'src/common/enums/leave-status.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';

@Injectable()
export class LeaveRequestService {

  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly notificationsService: NotificationsService
  ) {}

  async getAllLeaveRequests() {
    const leaveRequests = await this.leaveRequestRepository.find({ relations: ['user'] });

    if (!leaveRequests) {
      throw new NotFoundException('No leave requests found');
    } 
    
    return leaveRequests;
  }

  async getUserLeaveRequests(userId: number) {
    const leaveRequests = await this.leaveRequestRepository.find({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!leaveRequests) {
      throw new NotFoundException('No leave requests found for the specified user');
    }

    return leaveRequests;
  }

  async createLeaveRequest(userId: number, body: CreateLeaveRequestDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (body.startDate > body.endDate) {
      throw new NotFoundException('Invalid date range: startDate must be before endDate');
    }

    const leaveRequest = this.leaveRequestRepository.create({
      ...body,
      user,
      status: LeaveStatus.PENDING
    });

    await this.notificationsService.notify(
      userId, 
      NotificationType.LEAVE_REQUEST_PENDING, 
      { date: body.startDate }
    );

    return this.leaveRequestRepository.save(leaveRequest);
  }

  async updateLeaveRequest(id: number, body: UpdateLeaveRequestDto, userId?: number) {
    const leaveRequest = await this.leaveRequestRepository.findOne({ 
      where: { id },
      relations: ['user']
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (userId && leaveRequest.user.id !== userId) {
      throw new NotFoundException('You do not have permission to update this leave request');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new NotFoundException('Only pending leave requests can be updated');
    }

    if (body.startDate && body.endDate && body.startDate > body.endDate) {
      throw new NotFoundException('Invalid date range: startDate must be before endDate');
    }
  
    Object.assign(leaveRequest, body);

    return this.leaveRequestRepository.save(leaveRequest);
  }

  async deleteLeaveRequest(id: number, userId?: number) {
    const leaveRequest = await this.leaveRequestRepository.findOne({ 
      where: { id },
      relations: ['user']
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (userId && leaveRequest.user.id !== userId) {
      throw new NotFoundException('You do not have permission to delete this leave request');
    }

    await this.leaveRequestRepository.remove(leaveRequest);

    return { message: 'Leave request deleted successfully' };
  }

  async approveLeaveRequest(id: number) {
    const leaveRequest = await this.leaveRequestRepository.findOne({ 
      where: { id },
      relations: ['user'] 
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new NotFoundException('Only pending leave requests can be approved');
    }

    leaveRequest.status = LeaveStatus.APPROVED;

    await this.notificationsService.notify(
      leaveRequest.user.id, 
      NotificationType.LEAVE_REQUEST_APPROVED, 
      { date: leaveRequest.startDate }
    );

    return this.leaveRequestRepository.save(leaveRequest);
  }

  async rejectLeaveRequest(id: number) {
    const leaveRequest = await this.leaveRequestRepository.findOne({ 
      where: { id },
      relations: ['user'] 
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new NotFoundException('Only pending leave requests can be rejected');
    }

    leaveRequest.status = LeaveStatus.REJECTED;

    await this.notificationsService.notify(
      leaveRequest.user.id, 
      NotificationType.LEAVE_REQUEST_REJECTED, 
      { reason: 'Non spécifiée' } 
    );

    return this.leaveRequestRepository.save(leaveRequest);
  }

}