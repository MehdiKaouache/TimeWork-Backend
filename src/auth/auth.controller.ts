import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SignupDTO } from './dtos/signup.dto';
import { SigninDTO } from './dtos/signin.dto';
import { UpdateLoginDTO } from './dtos/update_login.dto';
import { RefreshTokenDTO } from './dtos/refresh_token.dto';

import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ForgotPasswordDTO } from './dtos/forgot_password.dto';
import { ResetPasswordDTO } from './dtos/reset_password.dto';


@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    /**
     * Registers a new user in the system.
     * @param body - Contains firstName, lastName, email, and password.
     * @returns A confirmation message.
     */
    @Post('/signup')
    signup(@Body() body : SignupDTO) {
        return this.authService.signup(body.firstName, body.lastName, body.email, body.password);
    }

    /**
     * Authenticates a user and returns a set of JWT tokens.
     * @param body - Contains email and password.
     * @returns Access token and Refresh token.
     */
    @HttpCode(HttpStatus.OK)
    @Post('/signin')
    signin(@Body() body: SigninDTO) {
        return this.authService.signin(body.email, body.password);
    }

    /**
     * Exchanges a valid refresh token for a new access token.
     * @param body - Contains the userId and the current refreshToken.
     * @returns A new short-lived access token.
     */
    @HttpCode(HttpStatus.OK)
    @Post('/refresh')
    refresh(@Body() body: RefreshTokenDTO) {
        return this.authService.refreshAccessToken(body.userId, body.refreshToken);
    }

    /**
     * Invalidates the user's session by clearing the refresh token from the database.
     * @param req - The authenticated request containing the user ID.
     * @returns A confirmation message.
     */
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('/logout')
    async logout(@Request() req: any) {
        return this.authService.logout(req.user.userId);
    }

    /**
     * Updates the user's email or password.
     * Invalidation of the current session occurs after a successful update.
     * @param req - The authenticated request.
     * @param body - Current password and new credentials.
     */
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('/update-login')
    updateLogin(
        @Request() req: any,
        @Body() body: UpdateLoginDTO
    ) {
        return this.authService.updateLogin(
            req.user.userId,
            body
        );
    }

    /**
     * Initiates the password recovery process.
     * @param body - Object containing the user's email.
     * @returns A message indicating that a reset link has been sent.
     */
    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    async forgotPassword(@Body() body: ForgotPasswordDTO) {
        return this.authService.forgotPassword(body.email);
    }

    /**
     * Resets the user's password using a valid reset token.
     * @param body - Contains userId, token, and newPassword.
     * @returns A confirmation message.
     */
    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDTO) {
        return this.authService.resetPassword(
            body.userId,
            body.token,
            body.newPassword
        );
    }

    /**
     * Retrieves the profile of the currently authenticated user.
     * @param req - The authenticated request.
     * @returns The user entity (excluding sensitive fields via @Exclude).
     */
    @Get('/whoami')
    @UseGuards(JwtAuthGuard)
    async whoAmI(@Request() req: any) {
        return this.authService.whoAmI(
            req.user.userId,
        );
    }
}
