import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';

/**
 * Strategy for validating JSON Web Tokens (JWT) from incoming request headers.
 * This strategy extracts the 'Bearer' token and verifies its signature.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  private readonly logger = new Logger(JwtStrategy.name); // Initialize Logger
  
    constructor(
      private readonly configService: ConfigService, private readonly usersService: UsersService
    ){
    super({
      // Extract token from the Authorization: Bearer <token> header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Rejects the request if the token has expired
      ignoreExpiration: false,

      // The secret used to sign the tokens (loaded from .env)
      secretOrKey: configService.get<string>('JWT_SECRET')
    });
  }

  /**
     * Passport automatically calls this method after verifying the JWT signature.
     * The return value is attached to the Request object as 'user'.
     * @param payload - The decoded content of the JWT.
     * @returns An object containing essential user data for the request lifecycle.
     * @throws UnauthorizedException if the payload is invalid.
     */
  async validate(payload: JwtPayload) {

    const user = await this.usersService.findOne(payload.sub);
    
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Session expired or logged out');
    }    

    // This object becomes accessible via @Request() req -> req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      employeeNumber: payload.employeeNumber
    };
  }
}