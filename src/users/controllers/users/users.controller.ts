import { Body, Controller, Get, Param, Patch, Post, Session, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO }  from './dtos/update-user.dto';
// import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import SerializeInterceptor from 'src/interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/currentUser.interceptor';
import { User } from './user.entity';
import { CurrentUser } from './decorators/currentUser.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';

@Controller('users')
// @UseInterceptors(CurrentUserInterceptor)
export class UsersController {

    constructor(private usersService : UsersService, private authService: AuthService) {}

    @Post('/signup')
    async createUser(@Body() body : CreateUserDTO, @Session() session: any) {
        const user = await this.authService.signup(body.email, body.password)
        session.userId = user.id
        return user
    }

    @Post('/signin')
    async signIn(@Body() body : CreateUserDTO, @Session() session: any) {
        const user = await this.authService.signin(body.email, body.password)
        session.userId = user.id
        session.admin = user.admin
        return user
    }

    // @UseGuards(AuthGuard)
    @Get("/whoami")
    async whoami(@CurrentUser() user: User){
        return user;
    }

    @UseGuards(AuthGuard)
    @Post("signout")
    signout(@Session() session: any){
        session.userId = null
    }

    @UseGuards(AuthGuard)
    @Patch('/:id')
    updateUser(@Param('id') id : string, @Body() body : UpdateUserDTO) {
        return this.usersService.updateUser(parseInt(id), body);
    }

    // @UseInterceptors(ClassSerializerInterceptor)
    // @UseInterceptors(new SerializeInterceptor(UserDto))
    @Serialize(UserDto)
    @Get('/:id')
    @UseGuards(AuthGuard)
    findUser(@Param('id') id : string) {
        return this.usersService.findUser(parseInt(id));
    }

    @Get()
    @UseGuards(AuthGuard)
    findAllUsers() {
        return this.usersService.findAllUsers();
    }

    @UseGuards(AdminGuard)
    @Delete('delete/:id')
    removeUser(@Param('id') id :string){
        return this.usersService.deleteUser(parseInt(id))
    }
}