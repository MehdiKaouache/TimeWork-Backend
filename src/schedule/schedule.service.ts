import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Schedule } from './entities/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto } from './dtos/create-schedule.dto';
import { UpdateScheduleDto } from './dtos/update-schedule.dto';
import { Shift } from 'src/shift/entities/shift.entity';

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepo: Repository<Schedule>,

        @InjectRepository(Shift)
        private readonly shiftRepo: Repository<Shift>
    ){}

    async createSchedule(dto: CreateScheduleDto){
        const shiftExists = await this.shiftRepo.count();
        
        if (shiftExists === 0) {
            throw new BadRequestException('Cannot create schedule: No shifts available');
        }

        const existing = await this.scheduleRepo.findOneBy({weekNumber: dto.weekNumber});

        if(existing){
            throw new BadRequestException('Schedule already exists');
        }

        const start = new Date(dto.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const schedule = this.scheduleRepo.create({
            weekNumber: dto.weekNumber,
            startDate: start,
            endDate: end
        });

        return await this.scheduleRepo.save(schedule);
    }

    async getAllSchedule(){
        return await this.scheduleRepo.find();
    }

    async findOneSchedule(id: number){
        const schedule = await this.scheduleRepo.findOneBy({id});
        if (!schedule){
            throw new NotFoundException('Schedule not found');
        }
        return schedule;
    }

    async upadteSchedule(id: number, dto: UpdateScheduleDto){
        const schedule = await this.findOneSchedule(id);

        if(dto.weekNumber){
            const existing = await this.scheduleRepo.findOneBy({weekNumber: dto.weekNumber});
            if(existing && existing.id !== id){
                throw new BadRequestException('Week number already in use');
            }
            schedule.weekNumber = dto.weekNumber;
        }

        if(dto.startDate){
            const start = new Date(dto.startDate);
            schedule.startDate = start;
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            schedule.endDate = end;
        }
        
        return await this.scheduleRepo.save(schedule);
    }

    async removeSchedule(id: number){
        const schedule = await this.findOneSchedule(id)
        await this.scheduleRepo.remove(schedule);
        return { message: 'Schedule deleted successfully'};
    }
}