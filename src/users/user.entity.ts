import { AfterInsert, Entity, Column, PrimaryGeneratedColumn} from "typeorm";
// import { Exclude } from "class-transformer";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column(/*Ajouter des trucs ici*/)
    email: string;

    @Column(/*Ajouter des trucs ici*/)
    // @Exclude()
    password: string;


}
