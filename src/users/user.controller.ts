import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-users.dto';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    createUser(@Body() body: CreateUserDto) {
        console.log(body.email, body.password);
    }
}
