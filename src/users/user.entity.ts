import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, AfterInsert } from 'typeorm';

@Entity()
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Exclude()
    @Column()
    password: string;

    @AfterInsert()
    logInsert() {
        console.log(`A new user with id ${this.id} has been inserted.`);
    }

    @Column({default: false})
    admin : boolean;
}