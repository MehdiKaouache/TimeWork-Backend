import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Controller('shift')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftController {
    constructor(private readonly shiftService: ShiftService) {}

    @Get()
    @Roles(UserRole.MANAGER)
    getAllShifts() {
        return this.shiftService.getAllShifts();
    }

    @Get('users/:userId')
    getUserShifts(@Param('userId', ParseIntPipe) userId: number) {
        return this.shiftService.getUserShifts(userId);
    }

    @Post('users/:userId')
    @Roles(UserRole.MANAGER, UserRole.ASSISTANT_MANAGER)
    createShift(
        @Param('userId', ParseIntPipe) userId: number,
        @Body() body: CreateShiftDto,
    ) {
        return this.shiftService.createShift(userId, body);
    }

    @Patch(':id')
    @Roles(UserRole.MANAGER, UserRole.ASSISTANT_MANAGER)
    updateShift(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateShiftDto,
    ) {
        return this.shiftService.updateShift(id, body);
    }

    @Delete(':id')
    @Roles(UserRole.MANAGER)
    deleteShift(@Param('id', ParseIntPipe) id: number) {
        return this.shiftService.deleteShift(id);
    }
}