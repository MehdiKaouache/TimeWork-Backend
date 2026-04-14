import { Injectable, NestMiddleware } from "@nestjs/common";
import { UsersService } from "../user.service";

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware{

    constructor(private userService : UsersService) {}

    async use(req: any, res: any, next: (error?: any) => void) {
        const {userId} = req.session || {};

        if (userId) {
            const user = await this.userService.findUser(userId);
            req.currentUser = user;
        }
        next();
    }
}