import { IsEmail, IsString, IsOptional } from "class-validator";

export class updateUser {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password: string;
}