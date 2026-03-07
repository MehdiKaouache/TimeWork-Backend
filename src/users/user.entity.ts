import { Exclude } from "class-transformer"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, AfterInsert, Index } from "typeorm"

export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'employee'
}

@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn({
        type : 'int'
    })
    id: number;

    @Index({ unique : true})
    @Column({
        type : 'varchar', 
        length : 10, 
        unique : true, 
        nullable : false
    })
    employeeNumber: string;


    @Column({
        type : 'varchar',
        length : 100,
        nullable : false
    })
    firstName: string;

    @Column({
        type : 'varchar',
        length : 100,
        nullable : false
    })
    lastName: string;

    @Index({ unique : true})
    @Column({
        type : 'varchar',
        length : 255,
        nullable : false
    })
    email: string;
    
    @Exclude()
    @Column({
        type : 'varchar',
        length : 255,
        nullable : false
    })
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.EMPLOYEE
     })
    role: UserRole;

    @Column({
        type : 'decimal',
        precision : 10,
        scale : 2,
        nullable : false
    })
    hourlyRate: number;

    @Column({
        type : 'boolean', 
        default: false 
    })
    isActive: boolean;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    updatedAt: Date;

    @BeforeInsert()
    generateEmployeeNumber() {
        const randomNumber = Math.floor(10000 + Math.random() * 90000);

        if (this.role === UserRole.ADMIN) {
            this.employeeNumber = `ADM${randomNumber}`;
        } else {
            this.employeeNumber = `EMP${randomNumber}`;
        }   
    }

    @AfterInsert()
    logInsert(){
        console.log(`Inserted user with id ${this.id}`)
    }
}