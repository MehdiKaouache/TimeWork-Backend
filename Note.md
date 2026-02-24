1- npm install @nestjs/typeorm typeorm sqlite3 => Commande pour installer les librairies sql3 et typeorm pour nest.js // TypeOrm permet de faire la lisaison backend et base de donne


2- ajouter le import TypeOrmModule dans notre main (le main pointe sur le app donc dans le app module)

    imports: TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite",
      entities:[],
      synchronize: true
    }
  )


3- cree l'entity souhaiter dans le module avec le nom : ModuleName.entity.ts

import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(/*Ajouter des trucs ici*/)
    email: string;

    @Column()
    password: string;

}


4- connecter l'entity avec le service

import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

}


5- ajouter l'import de l'entity dans le module

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}


6- ajouter l'entity dans la liste des entity dans le app

    imports: TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite",
      entities:[User],
      synchronize: true
    }
  )


7- faire la validation avec le dto