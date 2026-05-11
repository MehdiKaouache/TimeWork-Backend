import { Body, Controller, Get, Param, Patch, UseGuards, Delete, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { UpdateUserInfoDTO }  from 'src/users/dto/update-user-info.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UserResponseDto } from '../dto/user-response.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { User } from '../entity/user.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService : UsersService) {}

    @Serialize(UserResponseDto)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id : number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    updateUser(
        @Param('id', ParseIntPipe) id : number, 
        @Body() body : UpdateUserInfoDTO,
        @CurrentUser() currentUser: User
    ) {
        const isSelf = currentUser.id === id;
        const isManager = currentUser.role === UserRole.MANAGER;

        if (!isSelf && !isManager) {
            throw new ForbiddenException('You can only change your profile.');
        }
        
        return this.usersService.updateUser(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id : number) {
        return this.usersService.deleteUser(id);
    }
}