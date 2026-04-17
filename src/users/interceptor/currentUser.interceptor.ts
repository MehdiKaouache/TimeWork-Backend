import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users.service';

/**
 * Interceptor that fetches the full User entity from the database 
 * and attaches it to the request object as 'currentUser'.
 */
@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {

    constructor(private usersService : UsersService) {}

    /**
    * Intercepts the request to inject the User entity before the handler is called.
    */
    async intercept(context: ExecutionContext, handler: CallHandler) {
        const request = context.switchToHttp().getRequest();
    
        // We look for 'userId' which is typically attached by the JwtStrategy or session
        const userId = request.user?.userId || request.session?.userId;

        if (userId) {
            const user = await this.usersService.findOne(userId);
            request.currentUser = user;
        }
        
        return handler.handle();
    }
}