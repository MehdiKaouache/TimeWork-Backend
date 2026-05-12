import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entity/shift.entity';
import { User } from 'src/users/entity/user.entity';
import { Availability } from 'src/availability/entity/availability.entity';
import { LeaveRequest } from 'src/leave-request/entity/leave-request.entity';
import { Schedule } from 'src/schedule/entity/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift, User, Availability, LeaveRequest, Schedule ])
  ],
  providers: [ShiftService],
  controllers: [ShiftController]
})
export class ShiftModule {}
