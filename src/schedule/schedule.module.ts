import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entity/schedule.entity';
import { Shift } from 'src/shift/entity/shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, Shift])],
  exports: [TypeOrmModule],
  providers: [ScheduleService],
  controllers: [ScheduleController]
})
export class ScheduleModule {}
