import { Body, Controller, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import UpdateUserDTO  from './dtos/update-user.dto';
// import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import SerializeInterceptor from 'src/interceptors/serialize.interceptor';
import UserDto from './dtos/user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';

@Controller('users')
export class UsersController {

    constructor(private usersService : UsersService) {}

    @Post('/signup')
    createUser(@Body() body : CreateUserDTO) {
        return this.usersService.createUser(body.email, body.password)
    }

    @Patch('/:id')
    updateUser(@Param('id') id : string, @Body() body : UpdateUserDTO) {
        return this.usersService.updateUser(parseInt(id), body);
    }

    // @UseInterceptors(ClassSerializerInterceptor)
    // @UseInterceptors(new SerializeInterceptor(UserDto))
    @Serialize(UserDto)
    @Get('/:id')
    findUser(@Param('id') id : string) {
        return this.usersService.findUser(parseInt(id));
    }

    @Get()
    findAllUsers() {
        return this.usersService.findAllUsers();
    }

    
}