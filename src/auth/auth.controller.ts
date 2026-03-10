import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  UseGuards, 
  Request
} from '@nestjs/common';
import { SignupDTO } from './dtos/signup.dto';
import { SigninDTO } from './dtos/signin.dto';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/signup')
    signup(@Body() body : SignupDTO) {
        return this.authService.signup(
            body.firstName, 
            body.lastName, 
            body.email, 
            body.password
        );
    }

    @Post('/signin')
    signin(@Body() body: SigninDTO) {
        return this.authService.signin(body.email, body.password);
    }

    // on va utilise le localstorage dans le frontend pour stocker le token 
    // directement a la place de devoir lecrire nous meme.
    //  localStorage.setItem("token", response.access_token)
    //
    // quand on veux reprendre le toket pour l'utiliser sur une route on applique
    // fetch("/auth/whoami", {
    //     headers: {
    //         Authorization: `Bearer ${localStorage.getItem("token")}`
    //     }
    // })

    @UseGuards(AuthGuard('jwt'))
    @Get('/whoami')
    async whoAmI(@Request() req: any) {
        const user = await this.authService.whoAmI(req.user.userId);
        return user;
    }

}
