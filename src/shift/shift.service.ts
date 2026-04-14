import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShiftDto } from './dtos/create-shift.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shift } from './entities/shift.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UpdateShiftDto } from './dtos/update-shift.dto';
import { Availability } from 'src/availability/entities/availability.entity';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';
import { LeaveRequest } from 'src/leave-request/entities/leave-request.entity';
import { LeaveStatus } from 'src/common/enums/leave-status.enum';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Injectable()
export class ShiftService {
    constructor(
        @InjectRepository(Shift)
        private shiftRepository: Repository<Shift>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Schedule)
        private scheduleRepository: Repository<Schedule>,
        
        @InjectRepository(Availability)
        private availabilityRepository: Repository<Availability>,

        @InjectRepository(LeaveRequest)
        private leaveRequestRepository: Repository<LeaveRequest>,

    ) {}

    private mapJsDayToEnum(day: number): DayOfWeek {
            const map = {
                0: DayOfWeek.SUNDAY,
                1: DayOfWeek.MONDAY,
                2: DayOfWeek.TUESDAY,
                3: DayOfWeek.WEDNESDAY,
                4: DayOfWeek.THURSDAY,
                5: DayOfWeek.FRIDAY,
                6: DayOfWeek.SATURDAY,
            };

            return map[day];
    }

    async getAllShifts() {
        const shifts = await this.shiftRepository.find({ relations: ['user', /*'schedule'*/]});


        if (shifts.length === 0) {
            throw new NotFoundException('No shifts found');
        }

        return shifts;
    }

    async getUserShifts(userId: number) {
        const shifts = await this.shiftRepository.find({
            where: { user: { id: userId } }, relations: ['user', /*'schedule'*/] });

        if (shifts.length === 0) {
            throw new NotFoundException('No shifts found for the specified user');
        }

        return shifts;
    }

    async createShift(userId: number, body: CreateShiftDto) {

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const date = new Date(body.date);

        const leaves = await this.leaveRequestRepository.find({
            where: { 
                user : {id: userId },
                status: LeaveStatus.APPROVED
            } 
        });
            
        for (const leave of leaves) {
            const leaveStart = new Date(leave.startDate);
            const leaveEnd = new Date(leave.endDate);

            const isInLeave = date >= leaveStart && date <= leaveEnd;
    
            if (isInLeave) {
                throw new BadRequestException('User is on leave for this date');
            }
        }


        const jsDay = date.getDay();
        const dayOfWeek = this.mapJsDayToEnum(jsDay);

        const availability = await this.availabilityRepository.findOne({
            where: {
                user: { id: userId },
                dayOfWeek: dayOfWeek
            }
        });

        if (!availability || !availability.isAvailable){
            throw new BadRequestException('User is not available this day');
        }

        const startTime = body.startTime;
        const endTime = body.endTime;

        if (startTime >= endTime) {
            throw new BadRequestException('Invalid time range: startTime must be before endTime');
        }

        if (!availability.isAllDay) {

            if (!availability.startTime || !availability.endTime) {
                throw new BadRequestException('Availability hours are not defined');
            }

            if (
                startTime < availability.startTime ||
                endTime > availability.endTime
            ) {
                throw new BadRequestException('Shift is outside availability hours');
            }
        }

        const existingShift = await this.shiftRepository.findOne({
            where: {
                user: { id: userId },
                date: date
            }
        });

        if (existingShift) {
            throw new BadRequestException('User already has a shift for this day');
        }


        const shift = this.shiftRepository.create({
            ... body,
            date: date,
            user,
            //schedule
        });

        return this.shiftRepository.save(shift);
    }

    async updateShift(id: number, body: UpdateShiftDto) {

        const shift = await this.shiftRepository.findOne({
            where: { id }, relations: ['user', /*'schedule'*/] });

        if (!shift) {
            throw new NotFoundException('Shift not found');
        }

        const startTime = body.startTime ?? shift.startTime;
        const endTime = body.endTime ?? shift.endTime;

        if (startTime >= endTime) {
            throw new BadRequestException('Invalid time range: startTime must be before endTime');
        }

        if (body.date) {
            shift.date = new Date(body.date);
        }

        if (body.startTime) shift.startTime = body.startTime;
        if (body.endTime) shift.endTime = body.endTime;

        return this.shiftRepository.save(shift);
    }

    async deleteShift(id: number) {
        const shift = await this.shiftRepository.findOne({ where: { id } });

        if (!shift) {
            throw new NotFoundException('Shift not found');
        }

        await this.shiftRepository.remove(shift);

        return { message: 'Shift deleted successfully' };
    }
}