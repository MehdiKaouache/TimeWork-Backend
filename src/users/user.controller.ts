import { Body, Controller, Delete, Get, Param, Patch, Post, Session, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dtos/create-users.dto';
import { UpdateUser } from './dtos/update-user.dto';
import { Serialize } from '../interceptor/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorator/currentUser.decorator';
import { AuthGuard } from './guards/auth.guards';
import { AdminGuard } from './guards/admin.guard';

@Controller('users')
export class UsersController {

    constructor(private usersService : UsersService, private authService: AuthService) {}

    @Post('/signup')
    async createUser(@Body() body : CreateUserDto, @Session() session : any) {
        const user = await this.authService.signUp(body.email, body.password);
        session.userId = user.id;
        return user;
    }

    @Post('/signin')
    async signIn(@Body() body : CreateUserDto, @Session() session : any) {
        const user = await this.authService.signIn(body.email, body.password);
        session.userId = user.id;
        session.admin = user.admin;
        return user;
    }

    @Post('/signout')
    signOut(@Session() session : any) {
        session.userId = null;
    }

    @UseGuards(AuthGuard)
    @Get('/whoami')
    whoAmI(@CurrentUser() user : any) {
        return user;
    }

    @Patch('/update/:id')
    updateUser(@Param('id') id : string, @Body() body : UpdateUser) {
        return this.usersService.updateUser(parseInt(id), body);
    }

    @UseGuards(AuthGuard)
    @Serialize(UserDto)
    @Get('/:id')
    findUser(@Param('id') id : string) {
        return this.usersService.findUser(parseInt(id));
    }

    @UseGuards(AdminGuard)
    @UseGuards(AuthGuard)
    @Get()
    findAllUsers() {
        return this.usersService.findAllUsers();
    }

    @Delete('/:id')
    deleteUser(@Param('id') id : string) {
        return this.usersService.deleteUser(parseInt(id));
    }
    
}
