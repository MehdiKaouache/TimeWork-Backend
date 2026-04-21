import {
    IsNumber,
    IsString, 
    IsNotEmpty
} from 'class-validator';

export class RefreshTokenDTO {

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}