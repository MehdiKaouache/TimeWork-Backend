import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { User } from 'src/users/entities/user.entity';
import { Availability } from 'src/availability/entities/availability.entity';
import { LeaveRequest } from 'src/leave-request/entities/leave-request.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift, User, Availability, LeaveRequest, Schedule ])
  ],
  providers: [ShiftService],
  controllers: [ShiftController]
})
export class ShiftModule {}
