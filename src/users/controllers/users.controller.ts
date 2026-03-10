import { Body, Controller, Get, Param, Patch, Post, Session, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { UserResponseDto } from 'src/users/dtos/user-response.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UpdateUserDTO }  from 'src/users/dtos/update-user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {

    constructor(private usersService : UsersService) {}

    @Patch('/:id')
    updateUser(@Param('id') id : string, @Body() body : UpdateUserDTO) {
        return this.usersService.updateUser(parseInt(id), body);
    }

    @Serialize(UserResponseDto)
    @Get('/:id')
    findUser(@Param('id') id : string) {
        return this.usersService.findUser(parseInt(id));
    }

    @Get()
    findAllUsers() {
        return this.usersService.findAllUsers();
    }

    @Delete(':id')
    deleteUser(@Param('id') id :string){
        return this.usersService.deleteUser(parseInt(id))
    }
}