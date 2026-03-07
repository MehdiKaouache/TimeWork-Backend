import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService){}

    async signup(email: string, password: string){
        // 1. Check if email is in use
        const existingUser = await this.usersService.findAllUsersByEmail(email);

        if(existingUser.length){
            throw new BadRequestException("Email in use");
        }

        // 2. Hash le mdp du user
        // 2.1 generate a salt
        const salt = randomBytes(8).toString("hex")
        // 2.2 hash the salt and password together
        const hash = (await scrypt(password,salt,32)) as Buffer
        // 2.3 result + salt into db
        const result = salt + "." + hash.toString("hex")
        // 3. Create a new user
        const user = await this.usersService.createUser(email,result)
        // 4. Return new user
        return user
    }

    async signin(email: string, password: string){
        // 1. find user bt email
        const [user] = await this.usersService.findAllUsersByEmail(email)

        if(!user){
            throw new NotFoundException("User not found")
        }

        // recuperer le salt
        const [salt, storedHash] = user.password.split(".")

        // 2. hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer

        // 3. compare the hashed password with the stored hash
        if (hash.toString("hex") !== storedHash){
            throw new BadRequestException("invalid password")
        }

        return user
    }

    async whoAmI(userId: number){
        if(!userId){
            return "Logged out"
        }
        
        const user = await this.usersService.findUser(userId)
        return user
    }
}
