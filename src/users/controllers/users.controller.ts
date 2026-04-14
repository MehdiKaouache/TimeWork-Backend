import { Body, Controller, Get, Param, Patch, UseGuards, Delete, ParseIntPipe } from '@nestjs/common';
import { UpdateUserInfoDTO }  from 'src/users/dtos/update-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService : UsersService) {}

    // @Serialize(UserResponseDto)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id : number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    updateUser(@Param('id', ParseIntPipe) id : number, @Body() body : UpdateUserInfoDTO) {
        return this.usersService.updateUser(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe) id : number) {
        return this.usersService.deleteUser(id);
    }
}