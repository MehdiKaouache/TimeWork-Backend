import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUser } from './dtos/create-user.dto';
import { updateUser } from './dtos/update-user.dto';

@Controller('user')
export class UsersController {

    constructor(private usersService : UsersService) {}

    @Post('/signup')
    createUser(@Body() body : createUser) {
        return this.usersService.createUser(body.email, body.password)
    }

    @Patch('/update/:id')
    updateUser(@Param('id') id : string, @Body() body : updateUser) {
        return this.usersService.updateUser(parseInt(id), body);
    }

    @Get('/find/:id')
    findUser(@Param('id') id : string) {
        return this.usersService.findUser(parseInt(id));
    }

    @Get('/findAll')
    findAllUsers() {
        return this.usersService.findAllUsers();
    }

    
}
