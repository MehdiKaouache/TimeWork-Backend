import { IsEmail, IsString, IsOptional } from "class-validator";

export class UpdateUser {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password: string;
}