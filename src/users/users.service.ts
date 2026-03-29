import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    createUser(firstName : string, lastName: string, email : string, password : string) {

        const user = this.usersRepository.create({
            firstName,
            lastName,
            email,
            password
        });
        
        return this.usersRepository.save(user);
    }

    async findUser(id : number) {

        const user = await this.usersRepository.findOneBy({id});
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async findAllUsers() {

        const users = await this.usersRepository.find();
        
        if (!users || users.length === 0) {
            throw new NotFoundException("No users found");
        }

        return users;
    }

    async deleteUser(id: number) {

        const user = await this.usersRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        await this.usersRepository.remove(user);

        return { message: "User deleted successfully" };
    }

    async updateUser(id : number, 
        body : {
            firstName?: string,
            lastName?: string
        }
    ){

        const user = await this.usersRepository.findOneBy({id});

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (body.firstName !== undefined) {
            user.firstName = body.firstName;
        }

        if (body.lastName !== undefined) {
            user.lastName = body.lastName;
        }

        return this.usersRepository.save(user);
    }

    async findUserByEmail(email : string) {

        const user = await this.usersRepository.findOneBy({email});

        return user;
    }

    async updateUserLogin(id: number, email?: string, password?: string) {

        const user = await this.findUser(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        if (email !== undefined) {
            user.email = email;
        }
        
        if (password !== undefined) {
            user.password = password;
        }

        return this.usersRepository.save(user);
    }
}