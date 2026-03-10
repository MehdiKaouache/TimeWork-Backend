import { UserRole } from "src/common/enums/user-roles.enum";
import { LeaveRequest } from "./leave-request.entity";
import { Availability } from "./availability.entity";
import { Exclude } from "class-transformer";

import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn, 
    BeforeInsert, 
    Index, 
    OneToMany 
} from "typeorm"

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
        length : 50,
        nullable : false
    })
    password: string;

    @Column({
        type: 'text',
        default: UserRole.NEW_HIRE,
        nullable: true
     })
    role: UserRole;

    @Column({
        type : 'decimal',
        precision : 10,
        scale : 2,
        default : 0.00
    })
    hourlyRate: number;

    @Column({
        type : 'boolean', 
        default: false 
    })
    isActive: boolean;

    @Column({
        type: 'boolean',
        default: false,
    })
    isApproved: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Avant d'insérer un nouvel utilisateur dans la base de données, cette méthode génère un numéro d'employé unique en fonction du rôle de l'utilisateur (manager, assistant manager ou employé) et l'assigne à la propriété employeeNumber de l'entité User.
    @BeforeInsert()
    generateEmployeeNumber() {
        const randomNumber = Math.floor(10000 + Math.random() * 90000);

        switch (this.role) {
        case UserRole.MANAGER:
            this.employeeNumber = `MAN${randomNumber}`;
            break;

        case UserRole.ASSISTANT_MANAGER:
            this.employeeNumber = `ASM${randomNumber}`;
            break;

        default:
            this.employeeNumber = `EMP${randomNumber}`;
        }  
    }

    // Avant d'insérer un nouvel utilisateur dans la base de données, cette méthode convertit l'adresse e-mail de l'utilisateur en minuscules pour assurer la cohérence et éviter les problèmes liés à la casse lors de la recherche ou de la comparaison des adresses e-mail.
    @BeforeInsert()
    normalizeEmail() {
        this.email = this.email.toLowerCase();
    }

    // Il y a une relation OneToMany entre User et Availability, 
    // car un utilisateur peut avoir plusieurs disponibilités, 
    // mais une disponibilité appartient à un seul utilisateur.
    // @OneToMany(() => Availability, (availability) => availability.user)
    // availabilities: Availability[];
    
    // Il y a une relation OneToMany entre User et LeaveRequest, 
    // car un utilisateur peut faire plusieurs demandes de congé, 
    // mais une demande de congé appartient à un seul utilisateur.
    // @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
    // leaveRequests: LeaveRequest[];
}