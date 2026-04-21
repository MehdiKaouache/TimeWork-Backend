import { IsOptional, IsString, MaxLength, IsNotEmpty } from "class-validator"

export class UpdateUserInfoDTO {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @IsNotEmpty()
    firstName : string
    
    @IsString()
    @IsOptional()
    @MaxLength(100)
    @IsNotEmpty()
    lastName : string
}