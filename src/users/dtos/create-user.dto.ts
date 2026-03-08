import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator'
import { UserRole } from '../user.entity'
import { Type } from 'class-transformer'

export class CreateUserDTO { 

    @IsString()
    @IsNotEmpty()
    firstName : string

    @IsString()
    @IsNotEmpty()
    lastName : string

    @IsEmail()
    email : string

    @IsString()
    @MinLength(12)
    password : string

    @IsEnum(UserRole)
    role : UserRole

    @Type(() => Number)
    @IsNumber()
    @Min(21)
    hourlyRate : number
}