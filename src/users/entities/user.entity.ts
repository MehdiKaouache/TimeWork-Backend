import { UserRole } from "src/common/enums/user-roles.enum";
import { UserStatus } from "src/common/enums/user-status.enum";
import { Shift } from "../../shift/entities/shift.entity";
import { LeaveRequest } from "../../leave-request/entities/leave-request.entity";
import { Availability } from "../../availability/entities/availability.entity";
import { Exclude } from "class-transformer";


import { 
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert, 
    OneToMany 
} from "typeorm"

// L'entité User représente un utilisateur dans le système, avec des propriétés telles 
// que l'identifiant unique, le numéro d'employé, le prénom, le nom de famille, l'adresse e-mail, 
// le mot de passe, le rôle, le taux horaire, les indicateurs d'activité et d'approbation, 
// ainsi que les dates de création et de mise à jour. Elle inclut également des méthodes pour générer un numéro d'employé unique 
// et normaliser l'adresse e-mail avant l'insertion dans la base de données. En outre, elle établit des relations avec les entités 
// Availability et LeaveRequest, indiquant qu'un utilisateur peut avoir plusieurs disponibilités et demandes de congé, mais pas l'inverse.

@Entity('users')
export class User {
    
    // La propriété id sert à stocker l'identifiant unique de chaque utilisateur dans la base de données.
    @PrimaryGeneratedColumn({
        type : 'int'
    })
    id: number;

    // La propriété employeeNumber sert à stocker le numéro d'employé unique de chaque utilisateur.
    @Column({
        unique : true,
        type : 'varchar', 
        length : 10, 
        nullable : false
    })
    employeeNumber: string;

    // La propriété firstName sert à stocker le prénom de l'utilisateur.
    @Column({
        type : 'varchar',
        length : 100,
        nullable : false
    })
    firstName: string;

    // La propriété lastName sert à stocker le nom de famille de l'utilisateur.
    @Column({
        type : 'varchar',
        length : 100,
        nullable : false
    })
    lastName: string;

    // La propriété email sert à stocker l'adresse e-mail de l'utilisateur.
    @Column({
        unique : true,
        type : 'varchar',
        length : 255,
        nullable : false
    })
    email: string;
    
    // La propriété password sert à stocker le mot de passe de l'utilisateur.
    @Exclude()
    @Column({
        type : 'varchar',
        length :255,
        nullable : false
    })
    password: string;

    // La propriété role sert à stocker le rôle de l'utilisateur, a partir de l'énumération UserRole, par defaut NEW_HIRE.
    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.NEW_HIRE,
     })
    role: UserRole;

    // La propriété hourlyRate sert à stocker le taux horaire de l'utilisateur, avec une valeur par défaut de 0.00.
    @Column({
        type : 'decimal',
        precision : 10,
        scale : 2,
        default : 0
    })
    hourlyRate: number;

    // La propriété isActive sert à indiquer si l'utilisateur est actif ou non, avec une valeur par défaut de false.
    @Column({
        type : 'boolean', 
        default: false 
    })
    isActive: boolean;

    // la propriété status sert à indiquer le statut de l'approbation de l'utilisateur, avec une valeur par défaut de PENDING.
    @Column({
        type: 'simple-enum',
        enum: UserStatus,
        default: UserStatus.PENDING
    })
    status: UserStatus;

    // La propriété approvedBy sert à stocker le numero d'employe de l'utilisateur qui a approuvé le compte de l'utilisateur,
    @Column({ nullable: true })
    approvedBy?: string;

    // La propriété approvedAt sert à stocker la date à laquelle le compte de l'utilisateur a été approuvé.
    @Column({ nullable: true })
    approvedAt?: Date;

    // La propriété createdAt sert à stocker la date de création de l'utilisateur.
    @CreateDateColumn()
    createdAt: Date;

    // La propriété updatedAt sert à stocker la date de mise à jour de l'utilisateur.
    @UpdateDateColumn()
    updatedAt: Date;

    // Avant d'insérer un nouvel utilisateur dans la base de données, 
    // cette méthode génère un numéro d'employé unique en fonction du rôle de l'utilisateur 
    // (manager, assistant manager ou employé) et l'assigne à la propriété employeeNumber de l'entité User.
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

    // Avant d'insérer un nouvel utilisateur dans la base de données, cette méthode convertit l'adresse e-mail 
    // de l'utilisateur en minuscules pour assurer la cohérence et éviter les problèmes liés à la casse lors de la recherche 
    // ou de la comparaison des adresses e-mail.
    @BeforeInsert()
    normalizeEmail() {
        this.email = this.email.toLowerCase();
    }

    // Il y a une relation OneToMany entre User et Shift, 
    // car un utilisateur peut avoir plusieurs shifts, 
    // mais un shift appartient à un seul utilisateur.
    @OneToMany(() => Shift, (shift) => shift.user, {
        cascade: true,
    })
    shifts: Shift[];

    // Il y a une relation OneToMany entre User et Availability, 
    // car un utilisateur peut avoir plusieurs disponibilités, 
    // mais une disponibilité appartient à un seul utilisateur.
    @OneToMany(() => Availability, (availability) => availability.user, {
        cascade: true,
        nullable: false
    })
    availabilities: Availability[];
    
    // Il y a une relation OneToMany entre User et LeaveRequest, 
    // car un utilisateur peut faire plusieurs demandes de congé, 
    // mais une demande de congé appartient à un seul utilisateur.
    @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user, {
        cascade: true,
    })
    leaveRequests: LeaveRequest[];
}