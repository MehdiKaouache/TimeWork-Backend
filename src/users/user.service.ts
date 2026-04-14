import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserInfoDTO } from './dtos/update-user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    createUser(email : string, password : string) {
            const user = this.userRepository.create({email, password});
            return this.userRepository.save(user)
    }

    async findUser(id : number){
        const user = await this.userRepository.findOneBy({id});
        
        if (!user) {
            throw new NotFoundException("User not found");
        }
        
        return user;
    }

   async findAllUsers() {
        return await this.userRepository.find();
    }

    async deleteUser(id : number) {
        const user = await this.userRepository.findOneBy({id});

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return this.userRepository.remove(user);
    }

    async updateUser(id : number, body : UpdateUserInfoDTO) {
        const user = await this.userRepository.findOneBy({id});

        if (!user) {
            throw new NotFoundException("User not found");
        }

        Object.assign(user, body);
        return this.userRepository.save(user)
    }

    async findAllUsersByEmail(email : string) {
        return await this.userRepository.findBy({email});
    }
}
