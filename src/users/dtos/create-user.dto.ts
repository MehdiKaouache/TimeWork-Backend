import { IsString, IsEmail, IsNotEmpty } from "class-validator"

export class CreateUserDTO{
    @IsEmail()
    email : string

    @IsString()
    @IsNotEmpty()
    password : string
}