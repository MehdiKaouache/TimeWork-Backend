import { IsEmail, IsString, IsOptional } from "class-validator";

export class UpdateUserDTO {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password: string;
}