import { Body, Controller, Get, Param, Patch, Post, Session, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { UpdateUserDTO }  from 'src/users/dtos/update-user.dto';
import { UserResponseDto } from 'src/users/dtos/user-response.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';


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
    removeUser(@Param('id') id :string){
        return this.usersService.deleteUser(parseInt(id))
    }
}