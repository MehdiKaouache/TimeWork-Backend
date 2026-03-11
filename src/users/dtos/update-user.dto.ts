import { IsNotEmpty, IsString } from "class-validator"

export class UpdateUserDTO {
    @IsString()
    @IsNotEmpty()
    firstName : string
    
    @IsString()
    @IsNotEmpty()
    lastName : string
}