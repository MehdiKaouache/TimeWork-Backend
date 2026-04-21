import {
    IsNumber,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches
} from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/constants/regex.constants';

export class ResetPasswordDTO {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password is too short (minimum 8 characters)' })
    @MaxLength(50)
    // Ajoute d'une règle pour forcer au moins une majuscule et un chiffre
    @Matches(PASSWORD_REGEX, {
    message: 'Password is too weak. It must contain at least one uppercase letter and one number or special character.',
    })
    newPassword: string;
}