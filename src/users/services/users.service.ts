import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
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
        
        return this.usersRepository.save(user)
    }

    async findUser(id : number){
        const user = await this.usersRepository.findOneBy({id});
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    async findAllUsers() {
        return await this.usersRepository.find()   
    }

    async deleteUser(id: number) {

        const user = await this.usersRepository.findOneBy({ id });

        if (!user) {
            throw new Error("User not found");
        }

        await this.usersRepository.remove(user);

        return { message: "User deleted successfully" };
    }

    async updateUser(id : number, attrs : Partial<User>) {
        const user = await this.usersRepository.findOneBy({id});

        if (!user) {
            throw new NotFoundException("User not found");
        }

        Object.assign(user, attrs);
        return this.usersRepository.save(user)
    }

    async findUserByEmail(email : string){
        return await this.usersRepository.findOneBy({email})
    }
}