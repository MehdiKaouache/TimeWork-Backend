import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Schedule } from './entity/schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepo: Repository<Schedule>
    ){}

    async createSchedule(dto: CreateScheduleDto){
        const existing = await this.scheduleRepo.findOneBy({ name: dto.name });
        if(existing){
            throw new BadRequestException('Un planning avec ce nom existe déjà');
        }

        const schedule = this.scheduleRepo.create({
            name: dto.name,
            startDate: new Date(dto.startDate + 'T12:00:00'),
            endDate: new Date(dto.endDate + 'T12:00:00')
        });

        return await this.scheduleRepo.save(schedule);
    }

    async getAllSchedule() {
        return await this.scheduleRepo.find({ order: { startDate: 'ASC' } });
    }

    async findOneSchedule(id: number){
        const schedule = await this.scheduleRepo.findOneBy({id});
        if (!schedule) {
            throw new NotFoundException('Planning introuvable')
        }
        return schedule;
    }

    async updateSchedule(id: number, dto: UpdateScheduleDto){
        const schedule = await this.findOneSchedule(id);

        if (dto.name) {
            const existing = await this.scheduleRepo.findOneBy({ name: dto.name });
            if (existing && existing.id !== id) {
                throw new BadRequestException('Nom déjà utilisé');
            }
            schedule.name = dto.name;
        }
        if(dto.startDate) {
            schedule.startDate = new Date(dto.startDate + 'T12:00:00');
        }
        if (dto.endDate) {
            schedule.endDate = new Date(dto.endDate + 'T12:00:00');
        }
        return await this.scheduleRepo.save(schedule);
    }

    async removeSchedule(id: number){
        const schedule = await this.findOneSchedule(id);
        await this.scheduleRepo.remove(schedule);
        return { 
            message: 'Planning supprimé avec succès'
        };
    }
}