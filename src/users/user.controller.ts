import { Body, Controller, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dtos/create-users.dto';
import { updateUser } from './dtos/update-user.dto';
import { Serialize } from '../interceptor/serialize.interceptor';
import { UserDto } from './dtos/user.dto';

@Controller('users')
export class UsersController {

    constructor(private usersService : UsersService) {}

    @Post('/signup')
    createUser(@Body() body : CreateUserDto) {
        return this.usersService.createUser(body.email, body.password)
    }

    @Patch('/update/:id')
    updateUser(@Param('id') id : string, @Body() body : updateUser) {
        return this.usersService.updateUser(parseInt(id), body);
    }

    // @UseInterceptors(SerializeInterceptor(UserDto))
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
