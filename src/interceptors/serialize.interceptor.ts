import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToClass } from "class-transformer";

export class SerializeInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // Before the request is handled by the route handler
        console.log('before:', context);
        return handler.handle().pipe(
            map((data: any) => {
                // after the route handler has returned a response
                console.log('after:', data);
            })
        );
    }
}