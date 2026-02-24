import { IsEmail, IsString, IsOptional } from "class-validator";

export default class UpdateUserDTO {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    password: string;
}