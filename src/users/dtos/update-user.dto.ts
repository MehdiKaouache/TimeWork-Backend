import { IsOptional, IsString, Max, MaxLength } from "class-validator"

export class UpdateUserInfoDTO {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    firstName : string
    
    @IsString()
    @IsOptional()
    @MaxLength(100)
    lastName : string
}