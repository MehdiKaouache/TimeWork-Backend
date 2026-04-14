import { ExecutionContext, NestInterceptor, CallHandler, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UsersService } from "../user.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {

    constructor(private userService : UsersService) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        // Recuperer le user id
        const request = context.switchToHttp().getRequest();
        const userId = request.session.userId;

        //Retrouver le bon user
        if (!userId) {
            return next.handle();
        }
        else{
            const user = this.userService.findUser(userId);
            request.currentUser = user;
            return next.handle();
        }
    }
}