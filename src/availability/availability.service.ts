import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAvailabilityDto } from './dtos/create-availability.dto';
import { UpdateAvailabilityDto } from './dtos/update-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { User } from 'src/users/entities/user.entity';

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
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
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

    if(body.isAllDay == false || body.isAllDay == true) {
      body.startTime = undefined;
      body.endTime = undefined;
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

  async updateAvailability(id: number, body: UpdateAvailabilityDto) {
    const availability = await this.availabilityRepository.findOne({ where: { id } });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if(body.isAllDay === true) {
      body.isAllDay = true;
      body.startTime = undefined;
      body.endTime = undefined;
    }

    if(body.isAllDay === false) {
      body.isAllDay = false;
    }

    const startTime = body.startTime ?? availability.startTime;
    const endTime = body.endTime ?? availability.endTime;

    if(startTime && endTime && startTime >= endTime) {
      throw new BadRequestException('Invalid time range: startTime must be before endTime');
    }

    if(body.startTime) availability.startTime = body.startTime;
    if(body.endTime) availability.endTime = body.endTime;

    if(body.isAvailable !== undefined) availability.isAvailable = body.isAvailable;
    if(body.isAllDay !== undefined) availability.isAllDay = body.isAllDay;

    return this.availabilityRepository.save(availability);
  }

  async deleteAvailability(id: number) {
    const availability = await this.availabilityRepository.findOne({ where: { id } });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    await this.availabilityRepository.remove(availability);

    return { message: 'Availability deleted successfully' };
  }
}
