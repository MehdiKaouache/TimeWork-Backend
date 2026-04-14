import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift, User])
  ],
  providers: [ShiftService],
  controllers: [ShiftController]
})
export class ShiftModule {}
