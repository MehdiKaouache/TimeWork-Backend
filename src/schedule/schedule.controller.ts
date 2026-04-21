import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ScheduleService } from './schedule.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService){}

    @Post()
    @Roles(UserRole.MANAGER)
    create(@Body() createScheduleDto: CreateScheduleDto){
        return this.scheduleService.createSchedule(createScheduleDto);
    }

    @Get()
    findAll(){
        return this.scheduleService.getAllSchedule();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number){
        return this.scheduleService.findOneSchedule(id);
    }

    @Patch(':id')
    @Roles(UserRole.MANAGER)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateScheduleDto: UpdateScheduleDto){
        return this.scheduleService.upadteSchedule(id, updateScheduleDto);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    remove(@Param('id', ParseIntPipe) id: number){
        return this.scheduleService.removeSchedule(id);
    }
}
