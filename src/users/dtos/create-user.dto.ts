import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'


export class CreateUserDTO { 

    @IsString()
    @IsNotEmpty()
    firstName : string

    @IsString()
    @IsNotEmpty()
    lastName : string

    @IsEmail()
    @IsNotEmpty()
    email : string

    @IsString()
    @IsNotEmpty()
    @MinLength(12)
    password : string
}