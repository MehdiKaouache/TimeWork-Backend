import { Body, Controller, Get, Param, Patch, Post, Session, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import UpdateUserDTO  from './dtos/update-user.dto';
// import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import SerializeInterceptor from 'src/interceptors/serialize.interceptor';
import UserDto from './dtos/user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';

@Controller('users')
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
        return user
    }

    @Get("/whoami")
    async whoami(@Session() session: any){
        return await this.authService.whoAmI(session.userId)
    }

    @Post("signout")
    signout(@Session() session: any){
        session.userId = null
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