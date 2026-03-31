import { UsersService } from 'src/users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { promisify } from 'util';

import { 
    BadRequestException, 
    Injectable, 
    NotFoundException 
} from '@nestjs/common';


const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ){}

    /**     
     * Signup a new user
     * @param firstName 
     * @param lastName
     * @param email
     * @param password
     * @returns a message indicating that the user was created successfully
     * @throws BadRequestException if the email is already in use
     */

    async signup(firstName: string, lastName: string, email: string, password: string) {

        firstName = firstName.trim();
        lastName = lastName.trim();
        email = email.toLowerCase().trim();
        
        const existingEmail = await this.usersService.findUserByEmail(email);
        
        if(existingEmail) {
            throw new BadRequestException("Email already in use");
        }

        const salt = randomBytes(8).toString("hex");
        
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        
        const hashedPassword = `${salt}:${hash.toString('hex')}`;
        
        const user = await this.usersService.createUser(
            firstName,
            lastName,
            email,
            hashedPassword
        );

        return {
            message: `User with the email: ${email} created successfully`
        }
    }

    /**
     * Signin an existing user
     * @param email
     * @param password
     * @returns an access token for the signed-in user
     * @throws NotFoundException if the user is not found
     * @throws BadRequestException if the email or password is incorrect
     */

    async signin(email: string, password: string) {

        const user = await this.usersService.findUserByEmail(email);

        if(!user) {
            throw new NotFoundException("The email is not valide") // so we dont know wich one is wrong for security reasons
        }


        // If the user is not approved yet, we will not allow them to sign in manager approval is needed before signing in for the first time
        // this is to prevent unauthorized access and to ensure that only approved users can access the system
        
        if(user.status !== "approved") {
            throw new BadRequestException("Account is not approved yet")
        }

        const [salt, storedHash] = user.password.split(":");

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (hash.toString("hex") !== storedHash) {
            throw new BadRequestException("The password is not valide") // so we dont know wich one is wrong for security reasons
        }

        const payload = {
            sub: user.id,
            email: user.email,
            employeeNumber: user.employeeNumber
        }

        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token
        }
    }

    /**
     * Update the email and/or password of an existing user
     * @param userId - The ID of the user to update
     * @param body - An object containing the current password, and the new email and/or new password
     * @returns a message indicating that the login information was updated successfully
     * @throws NotFoundException if the user is not found
     * @throws BadRequestException if the current password is incorrect or if the new email is already in use
    */
   
    async updateLogin(
        userId: number,
        body: {
            currentPassword: string,
            newEmail?: string,
            newPassword?: string
        }
    ) {
        
        const user = await this.usersService.findOne(userId);
        
        if(!user) {
            throw new NotFoundException("User not found")
        }
        
        const [salt, storedHash] = user.password.split(".");
        
        const hash = (await scrypt(body.currentPassword, salt, 32)) as Buffer;
        
        if(hash.toString("hex") !== storedHash) {
            throw new BadRequestException("Current password is incorrect, try again")
        }
        
        let updatedEmail = user.email;
        let updatedPassword = user.password;
        
        // update email
        if(body.newEmail) {
            
            const existingUser = await this.usersService.findUserByEmail(body.newEmail);
            
            if(existingUser) {
                throw new BadRequestException("Email already in use, provide an other one")
            }
            
            updatedEmail = body.newEmail.toLowerCase().trim();
        }
        
        // update password
        if(body.newPassword) {

            const newSalt = randomBytes(8).toString("hex");

            const newHash = (await scrypt(body.newPassword, newSalt, 32)) as Buffer;
            
            updatedPassword = newSalt + "." + newHash.toString("hex");
        }

        // update the user with the new email and/or password
        const updatedUser = await this.usersService.updateUserCredentials(
            userId,
            updatedEmail,
            updatedPassword
        )
        
        return {
            message: "Login information updated successfully"
        }
        
    }
    
    /**
     * Get the currently signed-in user's information
     * @param userId - The ID of the currently signed-in user
     * @return the currently signed-in user's information
     * @throws BadRequestException if the user is not signed in
     * @throws NotFoundException if the user is not found
    */
   
    async whoAmI(userId: number) {
        
        if(!userId) {
            throw new BadRequestException("You must be signed in to access this resource")
        }
        
        const user = await this.usersService.findOne(userId);
        
        return user;
    }

    // need to verify all this, stills not sure how it all works, but the idea is that when the user signs in,
    // we will return a refresh token along with the access token, and when the access token expires,
    // the user can use the refresh token to get a new access token without having to sign in again if already signedin.
    async refreshToken(refreshToken: string) {
    
        try {
    
            const payload = await this.jwtService.verifyAsync(refreshToken);
    
            const newPayload = {
                sub: payload.sub,
                email: payload.email,
                employeeNumber: payload.employeeNumber
            }
    
            const newAccessToken = await this.jwtService.signAsync(newPayload);
    
            return {
                access_token: newAccessToken
            }
    
        } catch {
            throw new BadRequestException("Invalid refresh token") // if the token is expired, we will return an error (should not be invalide)
        }
    }
}