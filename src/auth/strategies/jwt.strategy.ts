import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/users.service';
import { UserStatus } from 'src/common/enums/user-status.enum';

/**
 * Strategy for validating JSON Web Tokens (JWT) from incoming request headers.
 * This strategy extracts the 'Bearer' token and verifies its signature.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  private readonly logger = new Logger(JwtStrategy.name);
  
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ){
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables'); 
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret
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
    
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }    

    if (!user.refreshToken) {
      throw new UnauthorizedException('Session invalidated. Please log in again.');
    }

    if (!user.isActive || user.status !== UserStatus.APPROVED) {
       throw new UnauthorizedException('Your account is no longer active or approved.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      employeeNumber: payload.employeeNumber
    };
  }
}