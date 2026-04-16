import { UsersService } from 'src/users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { promisify } from 'util';
import { UpdateLoginDTO } from './dtos/update-login.dto';

import { 
    BadRequestException, 
    Injectable, 
    NotFoundException 
} from '@nestjs/common';


const scrypt = promisify(_scrypt);

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
            throw new BadRequestException('Email already in use');
        }

        const salt = randomBytes(8).toString("hex");
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        
        const hashedPassword = `${salt}:${hash.toString('hex')}`;
        
        await this.usersService.createUser(
            firstName,
            lastName,
            email,
            hashedPassword
        );

        return {
            message: 'User created successfully'
        };
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

        email = email.toLowerCase().trim();
        
        const user = await this.usersService.findUserByEmail(email);

        if(!user) {
            throw new BadRequestException('Invalid credentials');
        }
        
        if(user.status !== 'approved') {
            throw new BadRequestException('Account is not approved yet, speak with the manager');
        }

        const [salt, storedHash] = user.password.split(':');

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (hash.toString('hex') !== storedHash) {
            throw new BadRequestException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            employeeNumber: user.employeeNumber
        };

        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: '1h'
        });

        return {
            access_token: accessToken
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
   
    async updateLogin( userId: number, body: UpdateLoginDTO) {
        
        const user = await this.usersService.findOne(userId);
        
        if(!user) {
            throw new NotFoundException('User not found');
        }
        
        const [salt, storedHash] = user.password.split(":");
        
        const hash = (await scrypt(body.currentPassword, salt, 32)) as Buffer;
        
        if(hash.toString("hex") !== storedHash) {
            throw new BadRequestException('Current password is incorrect');
        }
        
        let updatedEmail = user.email;
        let updatedPassword = user.password;
        
        // update email
        if(body.newEmail && body.newEmail !== user.email) {
                        
            const existingUser = await this.usersService.findUserByEmail(body.newEmail);

            if (existingUser) {
                throw new BadRequestException('Email already in use');
            }
            
            updatedEmail = body.newEmail.toLowerCase().trim();
        }
        
        // update password
        if(body.newPassword && body.newPassword.trim().length > 0) {

            const newSalt = randomBytes(8).toString("hex");

            const newHash = (await scrypt(body.newPassword, newSalt, 32)) as Buffer;
            
            updatedPassword = `${newSalt}:${newHash.toString('hex')}`;
        }

        await this.usersService.updateUserCredentials(
            userId,
            updatedEmail,
            updatedPassword
        );
        
        return {
            message: 'Login information updated successfully'
        };
        
    }
    
    /**
     * Get the currently signed-in user's information
     * @param userId - The ID of the currently signed-in user
     * @return the currently signed-in user's information
     * @throws BadRequestException if the user is not signed in
     * @throws NotFoundException if the user is not found
    */
   
    async whoAmI(userId: number) {
        
        const user = await this.usersService.findOne(userId);

        if(!user) {
            throw new NotFoundException('User not found');
        }
                
        return user;
    }
}