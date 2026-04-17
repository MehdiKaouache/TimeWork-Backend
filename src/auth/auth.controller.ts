import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SignupDTO } from './dtos/signup.dto';
import { SigninDTO } from './dtos/signin.dto';
import { UpdateLoginDTO } from './dtos/update_login.dto';
import { RefreshTokenDTO } from './dtos/refresh_token.dto';
import type { Request as ExpressRequest } from 'express';

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
    async logout(@Request() req: ExpressRequest) {
        const userId = (req as any).user.userId;
        return this.authService.logout(userId);
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
        @Request() req: ExpressRequest,
        @Body() body: UpdateLoginDTO
    ) {
        return this.authService.updateLogin(
            (req as any).user.userId,
            body
        );
    }

    /**
     * 
     * @param email 
     * @returns 
     */
    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    /**
     * 
     * @param userId 
     * @param token 
     * @param newPassword 
     * @returns 
     */
    @Post('reset-password')
    async resetPassword(
        @Body('userId') userId: number,
        @Body('token') token: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.authService.resetPassword(userId, token, newPassword);
    }
    /**
     * Retrieves the profile of the currently authenticated user.
     * @param req - The authenticated request.
     * @returns The user entity (excluding sensitive fields via @Exclude).
     */
    @Get('/whoami')
    @UseGuards(JwtAuthGuard)
    async whoAmI(@Request() req: ExpressRequest) {
        return this.authService.whoAmI(
          (req as any).user.userId,
        );
    }
}
