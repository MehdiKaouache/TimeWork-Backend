import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(/*Ajouter des trucs ici*/)
    email: string;

    @Column(/*Ajouter des trucs ici*/)
    password: string;

}
