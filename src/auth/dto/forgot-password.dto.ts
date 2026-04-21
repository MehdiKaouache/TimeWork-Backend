import { 
    IsNotEmpty,
    IsEmail
} from 'class-validator';

import { Transform } from 'class-transformer';

export class ForgotPasswordDTO {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
    @IsEmail()
    @IsNotEmpty()
    email: string;
}