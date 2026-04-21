import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Availability } from './entity/availability.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, User])],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService]
})
export class AvailabilityModule {}
