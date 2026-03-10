import { UsersService } from 'src/users/services/users.service';
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

    async signup(firstName: string, lastName: string, email: string, password: string){

        firstName = firstName.trim();
        lastName = lastName.trim();
        email = email.toLowerCase().trim();
        
        const existingUser = await this.usersService.findUserByEmail(email);
        
        if(existingUser){
            throw new BadRequestException("Email already in use");
        }

        const salt = randomBytes(8).toString("hex")
        
        const hash = (await scrypt(password,salt,32)) as Buffer
        
        const hashedPassword = salt + "." + hash.toString("hex")
        
        const user = await this.usersService.createUser(
            firstName,
            lastName,
            email,
            hashedPassword
        );

        return {
            message: "User created successfully",
            userId: user.id,
            email: user.email
        }
    }

    async signin(email: string, password: string){
        // 1. find user by email
        const user = await this.usersService.findUserByEmail(email)

        if(!user){
            throw new NotFoundException("The email or password is not valide")
        }

        // if(!user.isApproved){
        //     throw new BadRequestException("Account is not approved yet")
        // }

        const [salt, storedHash] = user.password.split(".")
        const hash = (await scrypt(password, salt, 32)) as Buffer

        if (hash.toString("hex") !== storedHash){
            throw new BadRequestException("The email or password is not valide")
        }

        const payload = {
            sub: user.id,
            email: user.email,
            employeeNumber: user.employeeNumber
        }

        const token = await this.jwtService.signAsync(payload)

        return {
            access_token: token
        }
    }

    async whoAmI(userId: number){
        if(!userId){
            return null
        }
        
        const user = await this.usersService.findUser(userId)
        return user
    }
}
