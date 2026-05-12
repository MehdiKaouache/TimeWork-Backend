import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

import { Roles } from 'src/common/decorator/roles.decorator';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

import { UserRole } from 'src/common/enums/user-roles.enum';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  /**
   * =========================
   * GET MY AVAILABILITIES
   * =========================
   */

  @Get('me')
  @Roles(
    UserRole.EMPLOYEE,
    UserRole.NEW_HIRE,
    UserRole.TRAINEE,
    UserRole.ASSISTANT_MANAGER,
    UserRole.MANAGER,
  )
  findMyAvailabilities(
    @CurrentUser('id') userId: number,
  ) {
    return this.availabilityService.getUserAvailabilites(
  userId,
);
  }

  /**
   * =========================
   * MANAGER - ALL AVAILABILITIES
   * =========================
   */

  @Get('all')
  @Roles(UserRole.MANAGER)
  findAll() {
    return this.availabilityService.getAllAvailabilities();
  }

  /**
   * =========================
   * MANAGER - USER AVAILABILITIES
   * =========================
   */

  @Get('users/:userId')
  @Roles(UserRole.MANAGER)
  findUserAvailabilities(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.availabilityService.getUserAvailabilites(
      userId,
    );
  }

  /**
   * =========================
   * CREATE AVAILABILITY
   * =========================
   */

  @Post()
  @Roles(
    UserRole.EMPLOYEE,
    UserRole.NEW_HIRE,
    UserRole.TRAINEE,
    UserRole.ASSISTANT_MANAGER,
  )
  create(
    @CurrentUser('id') userId: number,
    @Body() body: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createAvailability(
      userId,
      body,
    );
  }

  /**
   * =========================
   * UPDATE AVAILABILITY
   * =========================
   */

  @Patch(':id')
  @Roles(
    UserRole.EMPLOYEE,
    UserRole.NEW_HIRE,
    UserRole.TRAINEE,
    UserRole.ASSISTANT_MANAGER,
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAvailabilityDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.availabilityService.updateAvailability(
      id,
      body,
      userId,
    );
  }

  /**
   * =========================
   * DELETE AVAILABILITY
   * =========================
   */

  @Delete(':id')
  @Roles(
    UserRole.EMPLOYEE,
    UserRole.NEW_HIRE,
    UserRole.TRAINEE,
    UserRole.ASSISTANT_MANAGER,
  )
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.availabilityService.deleteAvailability(
      id,
      userId,
    );
  }
}