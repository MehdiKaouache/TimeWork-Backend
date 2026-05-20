import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entity/availability.entity';
import { User } from 'src/users/entity/user.entity';

@Injectable()
export class AvailabilityService {

  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getAllAvailabilities() {
    const availabilities = await this.availabilityRepository.find({ relations: ['user'] });

    if (availabilities.length === 0) {
      throw new NotFoundException('No availabilities found');
    }

    return availabilities;
  }

  async getUserAvailabilites(userId: number) {
    const availabilities = await this.availabilityRepository.find({
       where: { user: { id: userId } }, relations: ['user'] });

    if (availabilities.length === 0) {
      throw new NotFoundException('No availabilities found for the specified user');
    }

    return availabilities;
  }

  async createAvailability(userId: number, body: CreateAvailabilityDto) {
    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['company'] });

    if (!user) {
      throw new NotFoundException('Employé introuvable');
    }

    const existingAvailability = await this.availabilityRepository.findOne({
      where: {
        user: { id: userId },
        dayOfWeek: body.dayOfWeek
      }
    });

    if (existingAvailability) {
      throw new NotFoundException('Availability for this day already exists');
    }

    if(body.isAllDay === true) {
      if (user.company && user.company.operatingHours) {
        const dayStr = body.dayOfWeek.toLowerCase();
        const hours = user.company.operatingHours[dayStr];
        if (hours && hours.open && hours.close) {
          body.startTime = hours.open;
          body.endTime = hours.close;
        } else {
          body.startTime = "08:00";
          body.endTime = "17:00";
        }
      } else {
        body.startTime = "08:00";
        body.endTime = "17:00";
      }
    }

    if(body.startTime && body.endTime && body.startTime >= body.endTime) {
      throw new NotFoundException('Invalid time range: startTime must be before endTime');
    }

    const availability = this.availabilityRepository.create({
      ...body,
      user
    });

    return await this.availabilityRepository.save(availability);
  }

  async updateAvailability(id: number, body: UpdateAvailabilityDto, userId?: number) {
    const availability = await this.availabilityRepository.findOne({ 
      where: { id },
      relations: ['user', 'user.company']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (userId && availability.user.id !== userId) {
      throw new NotFoundException("Vous n'avez pas l'autorisation de modifier cette disponibilité");
    }

    if(body.isAllDay === true) {
      body.isAllDay = true;
      if (availability.user.company && availability.user.company.operatingHours) {
        const dayStr = availability.dayOfWeek.toLowerCase();
        const hours = availability.user.company.operatingHours[dayStr];
        if (hours && hours.open && hours.close) {
          body.startTime = hours.open;
          body.endTime = hours.close;
        } else {
          body.startTime = "08:00";
          body.endTime = "17:00";
        }
      } else {
        body.startTime = "08:00";
        body.endTime = "17:00";
      }
    }

    if(body.isAllDay === false) {
      body.isAllDay = false;
    }

    const startTime = body.startTime ?? availability.startTime;
    const endTime = body.endTime ?? availability.endTime;

    if(startTime && endTime && startTime >= endTime) {
      throw new BadRequestException("L'heure de début doit être avant l'heure de fin");
    }

    if(body.startTime) availability.startTime = body.startTime;
    if(body.endTime) availability.endTime = body.endTime;

    if(body.isAvailable !== undefined) availability.isAvailable = body.isAvailable;
    if(body.isAllDay !== undefined) availability.isAllDay = body.isAllDay;

    return this.availabilityRepository.save(availability);
  }

  async deleteAvailability(id: number, userId?: number) {
    const availability = await this.availabilityRepository.findOne({ 
      where: { id },
      relations: ['user']
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (userId && availability.user.id !== userId) {
      throw new NotFoundException("Vous n'avez pas l'autorisation de supprimer cette disponibilité");
    }

    await this.availabilityRepository.remove(availability);

    return { message: 'Disponibilité supprimée avec succès' };
  }
}
