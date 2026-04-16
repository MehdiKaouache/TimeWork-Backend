import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

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
import { UpdateLoginDTO } from './dtos/update-login.dto';
import type { Request as ExpressRequest } from 'express';

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

    // pour le logout on va juste supprimer 
    // le token du localstorage dans le frontend
    // localStorage.removeItem("token")

    @Post('/logout')
    logout() {
        return {
            message: "Logged out successfully"
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update-login')
    updateLogin(
        @Request() req: ExpressRequest,
        @Body() body: UpdateLoginDTO
    ) {
        return this.authService.updateLogin(
            (req as any).user.userId,
            body
        );
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

    @UseGuards(JwtAuthGuard)
    @Get('/whoami')
    async whoAmI(@Request() req: ExpressRequest) {
        return this.authService.whoAmI(
          (req as any).user.userId,
        );
    }
}
