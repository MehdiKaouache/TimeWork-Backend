import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { map, Observable } from "rxjs";

interface ClassConstructor{
    new (...args: any[]) : {}
}

export function Serialize(dto : ClassConstructor){
    return UseInterceptors(new SerializeInterceptor(dto))
}

export default class SerializeInterceptor implements NestInterceptor{

    constructor(private dto: any){

    }

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any>{
       // before the request is handled by the route handler
       // console.log(context)

       return handler.handle().pipe(
            map((data: any) => {
                // before the response is sent to the client
                // console.log("after...",data)
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true,
                })
            })
       )
    }
    
}