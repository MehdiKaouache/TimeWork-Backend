import { UsersService } from 'src/users/users.service';
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { promisify } from 'util';
import { UpdateLoginDTO } from './dtos/update_login.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { MailerService } from '@nestjs-modules/mailer';

import { 
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';


const scrypt = promisify(_scrypt);


async function hashValue(value: string): Promise<string> {
    const salt = randomBytes(8).toString("hex");
    const hash = (await scrypt(value, salt, 32)) as Buffer; 
    return `${salt}:${hash.toString('hex')}`;
}

async function verifyHash(value: string, storedHash: string): Promise<boolean> {
    const [salt, hash] = storedHash.split(':');
    const inputHash = (await scrypt(value, salt, 32)) as Buffer;
    const storedHashBuffer = Buffer.from(hash, 'hex');

    if (inputHash.length !== storedHashBuffer.length) return false;

    return timingSafeEqual(inputHash, storedHashBuffer);

}

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService
    ){}

    /**
     * Signup a new user.
     * The user is created with a PENDING status and must be approved by a manager.
     * The password is hashed using scrypt before storage.
     * @param firstName - The first name of the user
     * @param lastName - The last name of the user
     * @param email - The email of the user
     * @param password - The plain text password (will be hashed)
     * @returns A message confirming successful registration
     * @throws BadRequestException if the email is already in use
     */
    async signup(firstName: string, lastName: string, email: string, password: string) {

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await this.usersService.findUserByEmail(normalizedEmail);
        
        if (existingUser) {
            throw new ConflictException('This email is already registered. Please try logging in instead.');
        }

        const hashedPassword = await hashValue(password);

        try {
            await this.usersService.createUser(
                firstName.trim(), 
                lastName.trim(), 
                email, 
                hashedPassword
            );
        return {
            message: 'Account created successfully. Please wait for manager to approve your access.'
        };
        } catch(e) {
            throw new InternalServerErrorException(
                'Something went wrong during registration. Please try again later.' + 
                ' If the problem persists speak with a manager')
        }
    }

    /**
     * Signs in an existing user and returns a short-lived access token and a long-lived refresh token.
     * The refresh token is hashed before being stored in the database.
     * @param email - The email of the user
     * @param password - The plain text password
     * @returns An access token (15m) and a refresh token (7d)
     * @throws BadRequestException if credentials are invalid
     * @throws ForbiddenException if the account is not approved or not active
     */
    async signin(email: string, password: string) {
        
        const normalizedEmail = email.toLowerCase().trim();

        const user = await this.usersService.findUserByEmail(normalizedEmail);

        if (!user) {
            throw new UnauthorizedException('Invalid email or password. Please check your credentials.');
        }

        if (user.status === UserStatus.REJECTED) {
            throw new ForbiddenException('Your account request has been declined. Please contact administration for more information.');
        } 

        if (user.status === UserStatus.PENDING) {
            throw new ForbiddenException('Your account is currently pending approval. You will receive access once a manager validates your profile.');
        }

        if (!user.isActive) {
            throw new ForbiddenException('This account has been deactivated. Please contact your administrator.');
        }

        const isPasswordValid = await verifyHash(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password. Please check your credentials.');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            employeeNumber: user.employeeNumber
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        ]);

        const hashedRefreshToken = await hashValue(refreshToken);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken,
            userId: user.id,
            role: user.role,
            userFirstName: user.firstName
        };
    }

    /**
     * Issues a new access token using a valid refresh token.
     * @param userId - The ID of the user requesting the refresh
     * @param refreshToken - The raw refresh token sent by the client
     * @returns A new access token
     * @throws UnauthorizedException if the refresh token is invalid or expired
     */
    async refreshAccessToken(userId: number, refreshToken: string) {

        const user = await this.usersService.findOne(userId);

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Your session has expired or you have logged out. Please sign in again.');
        }

        const isRefreshTokenValid = await verifyHash(refreshToken, user.refreshToken);

        if (!isRefreshTokenValid) {
            throw new UnauthorizedException('Invalid session. For security reasons, please log in again.');
        }

        if (!user.isActive || user.status !== UserStatus.APPROVED) {
            throw new ForbiddenException('Your account is no longer authorized to perform this action.');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            employeeNumber: user.employeeNumber,
        };

        const newAccessToken = await this.jwtService.signAsync(payload, { expiresIn: '15m' });

        return { accessToken: newAccessToken };
    }

     /**
     * Logs out the currently signed-in user by clearing their refresh token.
     * This invalidates all future refresh attempts for this session.
     * @param userId - The ID of the user to log out
     * @returns A message confirming successful logout
     * @throws NotFoundException if the user is not found
     */
    async logout(userId: number) {

        const user = await this.usersService.findOne(userId);

        if (!user) {
            throw new NotFoundException('User profile not found.');
        }   

        await this.usersService.updateRefreshToken(userId, null);

        return { message: 'You have been logged out successfully.' };
    }

    /**
     * Updates the email and/or password of the currently signed-in user.
     * Requires the current password to be provided as confirmation.
     * @param userId - The ID of the user to update
     * @param body - Object containing currentPassword and optional newEmail / newPassword
     * @returns A message confirming the update
     * @throws NotFoundException if the user is not found
     * @throws ForbiddenException if the account is not active
     * @throws BadRequestException if the current password is wrong or the new email is taken
     */
    async updateLogin( userId: number, body: UpdateLoginDTO) {
        
        const user = await this.usersService.findOne(userId);
        
        if (!user) {
            throw new NotFoundException('User profile not found.');
        }
        
        if (!user.isActive) {
            throw new ForbiddenException('Cannot update a deactivated account.');
        }

        const isPasswordValid = await verifyHash(body.currentPassword, user.password);
        
        if (!isPasswordValid) {
            throw new BadRequestException('The current password you provided is incorrect.');
        }
        
        let updatedEmail = user.email;
        let updatedPassword = user.password;
        
        if (body.newEmail && body.newEmail.toLowerCase().trim() !== user.email) {
                     
            const normalizedNewEmail = body.newEmail.toLowerCase().trim();

            const existingUser = await this.usersService.findUserByEmail(normalizedNewEmail);

            if (existingUser) {
                throw new ConflictException('This new email address is already in use by another account.');
            }
            
            updatedEmail = normalizedNewEmail
        }
        
        if (body.newPassword && body.newPassword.trim().length > 0) {

            updatedPassword = await hashValue(body.newPassword)
        }

        await this.usersService.updateUserCredentials(userId, updatedEmail, updatedPassword);
        
        await this.usersService.updateRefreshToken(userId, null);

        return { message: 'Your login information has been updated. Please sign in again with your new credentials.' };
        
    }
    
    /**
     * 
     * @param email 
     * @returns 
     */
    async forgotPassword(email: string) {
        
        const normalizedEmail = email.toLowerCase().trim();

        const user = await this.usersService.findUserByEmail(normalizedEmail);

        if (!user) {
            return { message: 'If an account exists with this email, a reset link has been sent.' };
        }

        const resetToken = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(resetToken).digest('hex');

        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1);
        await this.usersService.savePasswordResetToken(user.id, hashedToken, expiry);

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&userId=${user.id}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'TimeWork - Password Reset Request',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">TIMEWORK</h1>
                    </div>
                    <div style="padding: 30px; background-color: #ffffff;">
                        <h2 style="color: #333; margin-top: 0;">Hello ${user.firstName},</h2>
                        <p style="color: #555; line-height: 1.6;">
                            We received a request to reset the password for your <strong>TimeWork</strong> account. 
                            Manage your shifts and schedule efficiently by keeping your account secure.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                            style="background-color: #3498db; color: white; padding: 14px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                            Reset Password
                            </a>
                        </div>
                        <p style="color: #777; font-size: 14px;">
                            <strong>Security Note:</strong> This link is only valid for 1 hour. If you did not request this, please contact your manager or system administrator immediately.
                        </p>
                    </div>
                    <div style="background-color: #f4f7f6; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                        <p style="color: #999; font-size: 11px; margin: 0; text-transform: uppercase;">
                            TimeWork Management System
                        </p>
                        <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                            &copy; 2026 TimeWork - Software Development Project
                        </p>
                    </div>
                </div>
            `,
        });

        return { 
            message: 'If an account exists with this email, a reset link has been sent.',
        };
    }

    /**
     * 
     * @param userId 
     * @param token 
     * @param newPassword 
     * @returns 
     */
    async resetPassword(userId: number, token: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);

    // 1. Check if the user exists and has a token stored
    if (!user || !user.passwordResetToken || !user.passwordResetExpiresAt) {
        throw new UnauthorizedException('Invalid or expired password reset request.');
    }

    // 2. Hash the incoming token to compare
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // 3. Verify token match
    const isTokenValid = user.passwordResetToken === hashedToken;

    // 4. Verify expiry (TypeScript is happy now because of the check in step 1)
    const isNotExpired = user.passwordResetExpiresAt > new Date();

    if (!isTokenValid || !isNotExpired) {
        throw new UnauthorizedException('The reset link is invalid or has expired.');
    }

    // 5. Success! Hash the new password and clear the reset fields
    const hashedPassword = await hashValue(newPassword);
    await this.usersService.updatePassword(user.id, hashedPassword);
    
    // 6. Clear the token so it can't be used again
    await this.usersService.savePasswordResetToken(user.id, null, null);

    return { message: 'Your password has been reset successfully. You can now log in.' };
}
    /**
     * Returns the profile of the currently signed-in user.
     * @param userId - The ID of the currently signed-in user
     * @returns The user's profile (password excluded via @Exclude on entity)
     * @throws NotFoundException if the user is not found
     */
    async whoAmI(userId: number) {
        
        const user = await this.usersService.findOne(userId);

        if (!user) {
            throw new NotFoundException('User profile not found.');
        }
                
        return user;
    }
}