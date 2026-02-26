import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from './user.service';
import { randomBytes, scrypt as _scrypt} from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {

    constructor(private usersService: UsersService){}

    async signUp(email: string, password: string){
        // 1. Tchek if email is in use
        const existingUser = await this.usersService.findAllUsersByEmail(email);

        if (existingUser.length) {
            throw new BadRequestException("Email in use");
        }
        // 2. Hash user password
        // 2.1 Generate a salt
        const salt = randomBytes(8).toString('hex');
        // 2.2 Hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        // 2.3 Result = salt into db 
        const result = salt + "." + hash.toString('hex');

        // 3. Create a new user 
        const user = await this.usersService.createUser(email, result);
        // 4. Return the user
        return user;
    }

    async signIn(email: string, password: string){
        // 1. Find user by email
        const [ user ] = await this.usersService.findAllUsersByEmail(email);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        // recuperer le salt et le hash
        const [salt, storedHash] = user.password.split('.');

        //2. Hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        //3. Compare the hash with stored hash
        if (storedHash !== hash.toString('hex')) {
            throw new BadRequestException("Invalid password");
        }

        // 4. Return the user
        return user;
    }

    async whoAmI(userId: number) {
        if (!userId) {
            return "Logged out";
        }

        const user = this.usersService.findUser(userId);
        return user;
    }
}
