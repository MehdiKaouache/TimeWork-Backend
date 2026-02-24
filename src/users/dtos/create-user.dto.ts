import { IsEmail, IsString, IsNotEmpty } from "class-validator";

export class createUser {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}