import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * A guard that extends the AuthGuard from @nestjs/passport to implement JWT authentication.
 * It uses the 'jwt' strategy defined in the Passport configuration to validate the JWT token in the request.
 * If the token is valid, it allows access to the route; otherwise, it denies access.
 */

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}