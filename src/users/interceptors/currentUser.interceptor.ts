import { ExecutionContext, NestInterceptor, CallHandler, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { UsersService } from "../services/users.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor{
    
    constructor(private userService: UsersService){}

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>>{
        
        const request = context.switchToHttp().getRequest()
        const {userId} = request.session || {}

        if(!userId){
            return next.handle();
        }
        else{
            const user = await this.userService.findUser(userId)

            request.currentUser = user
            request.role = user.role
            
            return next.handle()
        }
    }
}