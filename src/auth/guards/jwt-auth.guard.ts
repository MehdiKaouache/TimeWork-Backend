import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard used to protect routes that require a valid JSON Web Token.
 * Extends the Passport JWT strategy.
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any){

        if(err || !user){
            throw err || new UnauthorizedException('Unauthorized');
        }

        return user;
    }
}