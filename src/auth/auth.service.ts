import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UpdateLoginDTO } from './dto/update_login.dto';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { MailerService } from '@nestjs-modules/mailer';
import { HashUtils } from 'src/common/utils/hash.util';

import { 
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
    Logger
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
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
     * @throws ConflictException if the email is already in use
     * @throws InternalServerErrorException if the creation process fails
     */
    async signup(firstName: string, lastName: string, email: string, password: string, phoneNumber: string) {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await this.usersService.findUserByEmail(normalizedEmail);
        
        if (existingUser) {
            throw new ConflictException('This email is already registered. Please try logging in instead.');
        }

        const hashedPassword = await HashUtils.hashValue(password);

        try {
            await this.usersService.createUser(
                firstName.trim(), 
                lastName.trim(), 
                email,
                phoneNumber.trim(),
                hashedPassword,
            );
            
            return {
                message: 'Account created successfully. Please wait for manager to approve your access.'
            };
        } catch(e) {
            this.logger.error(`Signup error for email ${email}:`, e);
            throw new InternalServerErrorException(
                'Something went wrong during registration. Please try again later. If the problem persists speak with a manager.'
            );
        }
    }

    /**
     * Signs in an existing user and returns a short-lived access token and a long-lived refresh token.
     * The refresh token is hashed before being stored in the database.
     * @param email - The email of the user
     * @param password - The plain text password
     * @returns An access token (15m) and a refresh token (7d)
     * @throws UnauthorizedException if credentials are invalid
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

        const isPasswordValid = await HashUtils.verifyHash(user.password, password);

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

        const hashedRefreshToken = await HashUtils.hashValue(refreshToken);
        await this.usersService.updateRefreshToken(user.id, hashedRefreshToken);

        return {
            accessToken,
            refreshToken,
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
     * @throws ForbiddenException if the account is deactivated or not approved
     */
    async refreshAccessToken(userId: number, refreshToken: string) {
        const user = await this.usersService.findOne(userId);

        if (!user || !user.refreshToken) {
            throw new UnauthorizedException('Your session has expired or you have logged out. Please sign in again.');
        }

        const isRefreshTokenValid = await HashUtils.verifyHash(refreshToken, user.refreshToken);

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
     * @throws BadRequestException if the current password is wrong
     * @throws ConflictException if the new email is already taken
     */
    async updateLogin(userId: number, body: UpdateLoginDTO) {
        const user = await this.usersService.findOne(userId);
        
        if (!user) {
            throw new NotFoundException('User profile not found.');
        }

        if (!body.newEmail && !body.newPassword) {
            throw new BadRequestException('Please provide a new email or a new password to update.');
        }

        const isPasswordValid = await HashUtils.verifyHash(body.currentPassword, user.password);
        
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
            
            updatedEmail = normalizedNewEmail;
        }
        
        if (body.newPassword && body.newPassword.trim().length > 0) {
            updatedPassword = await HashUtils.hashValue(body.newPassword);
        }

        await this.usersService.updateUserCredentials(userId, updatedEmail, updatedPassword);
        await this.usersService.updateRefreshToken(userId, null); 

        return { message: 'Your login information has been updated. Please sign in again with your new credentials.' };
    }
    
    /**
     * Generates a password reset token and sends it to the user's email.
     * Uses SHA-256 to hash the token before storing it in the database.
     * @param email - The email address associated with the account
     * @returns A generic success message to prevent email enumeration
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

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&userId=${user.id}`;

        /**
         *  move the frontend to the frontend repo so its more clean
         */
        await this.mailerService.sendMail({
            to: user.email,
            subject: 'TimeWork - Password Reset Request',
            template: 'forgot-password', 
            context: {
                firstName: user.firstName,
                resetUrl: resetUrl,
            },
        });

        return { message: 'If an account exists with this email, a reset link has been sent.' };
    }

    /**
     * Validates a reset token and updates the user's password if valid.
     * @param userId - The ID of the user resetting their password
     * @param token - The raw reset token sent via email
     * @param newPassword - The new plain text password
     * @returns A success message upon password update
     * @throws UnauthorizedException if the token is invalid, missing, or expired
     */
    async resetPassword(userId: number, token: string, newPassword: string) {
        const user = await this.usersService.findOne(userId);

        if (!user || !user.passwordResetToken || !user.passwordResetExpiresAt) {
            throw new UnauthorizedException('Invalid or expired password reset request.');
        }

        const hashedToken = createHash('sha256').update(token).digest('hex');
        const isTokenValid = user.passwordResetToken === hashedToken;
        const isNotExpired = user.passwordResetExpiresAt > new Date();

        if (!isTokenValid || !isNotExpired) {
            throw new UnauthorizedException('The reset link is invalid or has expired.');
        }

        const hashedPassword = await HashUtils.hashValue(newPassword);
        await this.usersService.updatePassword(user.id, hashedPassword);
        
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