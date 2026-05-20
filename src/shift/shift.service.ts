import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShiftDto } from './dto/create-shift.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shift } from './entity/shift.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entity/user.entity';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { Availability } from 'src/availability/entity/availability.entity';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';
import { LeaveRequest } from 'src/leave-request/entity/leave-request.entity';
import { LeaveStatus } from 'src/common/enums/leave-status.enum';
import { Schedule } from 'src/schedule/entity/schedule.entity';

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
        const shifts = await this.shiftRepository.find({ 
            relations: ['user', 'schedule'],
            order: { date: 'ASC', startTime: 'ASC' }
        });


        if (shifts.length === 0) {
            throw new NotFoundException('No shifts found');
        }

        return shifts;
    }

    async getUserShifts(userId: number) {
        const shifts = await this.shiftRepository.find({
            where: { user: { id: userId } }, 
            relations: ['user', 'schedule'],
            order: { date: 'ASC', startTime: 'ASC' }
        });

        if (shifts.length === 0) {
            throw new NotFoundException('No shifts found for the specified user');
        }

        return shifts;
    }

    async createShift(userId: number, body: CreateShiftDto) {

        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('Employé introuvable');
        }

        const dateStr = body.date;
        const dateObj = new Date(dateStr + 'T12:00:00');

        const leaves = await this.leaveRequestRepository.find({
            where: { 
                user : {id: userId },
                status: LeaveStatus.APPROVED
            } 
        });
            
        for (const leave of leaves) {
            const leaveStart = new Date(leave.startDate + 'T12:00:00');
            const leaveEnd = new Date(leave.endDate + 'T12:00:00');

            const isInLeave = dateObj >= leaveStart && dateObj <= leaveEnd;
    
            if (isInLeave) {
                throw new BadRequestException("L'employé est en congé à cette date");
            }
        }


        const jsDay = dateObj.getDay();
        const dayOfWeek = this.mapJsDayToEnum(jsDay);

        const availability = await this.availabilityRepository.findOne({
            where: {
                user: { id: userId },
                dayOfWeek: dayOfWeek
            }
        });

        if (!availability || !availability.isAvailable){
            throw new BadRequestException("L'employé n'est pas disponible ce jour-là");
        }

        const startTime = body.startTime;
        const endTime = body.endTime;

        if (startTime >= endTime) {
            throw new BadRequestException("L'heure de début doit être avant l'heure de fin");
        }

        if (!availability.isAllDay) {

            if (!availability.startTime || !availability.endTime) {
                throw new BadRequestException("Les heures de disponibilité ne sont pas définies");
            }

            if (
                startTime < availability.startTime ||
                endTime > availability.endTime
            ) {
                throw new BadRequestException("Le shift est en dehors des heures de disponibilité");
            }
        }

        const existingShifts = await this.shiftRepository.find({
            where: {
                user: { id: userId },
                date: dateObj
            }
        });

        for (const existingShift of existingShifts) {
            if (startTime < existingShift.endTime && endTime > existingShift.startTime) {
                throw new BadRequestException("L'employé a déjà un shift en même temps");
            }
        }

        const maxCapacity = 4;
        const totalShiftsForDay = await this.shiftRepository.count({
            where: { date: dateObj }
        });

        if (totalShiftsForDay >= maxCapacity) {
            throw new BadRequestException('Capacité maximale atteinte');
        }


        const { scheduleId, ...restBody } = body;
        const schedule = await this.scheduleRepository.findOne({ where: { id: scheduleId } });
        if (!schedule) {
            throw new NotFoundException('Planning introuvable');
        }

        const shift = this.shiftRepository.create({
            ...restBody,
            date: dateObj,
            user,
            schedule,
        });

        return this.shiftRepository.save(shift);
    }

    async updateShift(id: number, body: UpdateShiftDto) {

        const shift = await this.shiftRepository.findOne({
            where: { id }, relations: ['user', 'schedule'] });

        if (!shift) {
            throw new NotFoundException('Shift introuvable');
        }

        const startTime = body.startTime ?? shift.startTime;
        const endTime = body.endTime ?? shift.endTime;

        if (startTime >= endTime) {
            throw new BadRequestException("L'heure de début doit être avant l'heure de fin");
        }

        if (body.date) {
            shift.date = new Date(body.date + 'T12:00:00');
        }

        if (body.startTime) shift.startTime = body.startTime;
        if (body.endTime) shift.endTime = body.endTime;

        return this.shiftRepository.save(shift);
    }

    async deleteShift(id: number) {
        const shift = await this.shiftRepository.findOne({ where: { id } });

        if (!shift) {
            throw new NotFoundException('Shift introuvable');
        }

        await this.shiftRepository.remove(shift);

        return { message: 'Shift deleted successfully' };
    }
}