import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "../../users/entity/user.entity";
import { LeaveStatus } from "src/common/enums/leave-status.enum";

// L'entité LeaveRequest représente une demande de congé dans le système, avec des propriétés telles 
// que l'identifiant unique, les dates de début et de fin, la raison, le statut, et 
// les dates de création et de mise à jour, ainsi que la relation avec l'entité User qui permet d'associer une demande de congé à un utilisateur.

@Entity('leave_requests')
export class LeaveRequest {

    // La propriété id sert à stocker l'identifiant unique de chaque demande de congé dans la base de données.
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    // La propriété startDate sert à stocker la date de début de la demande de congé.
    @Column({
        type: 'date',
        nullable: false
    })
    startDate: string;

    // La propriété endDate sert à stocker la date de fin de la demande de congé.
    @Column({
        type: 'date',
        nullable: false
    })
    endDate: string;

    // La propriété reason sert à stocker la raison de la demande de congé.
    @Column({
        type: 'varchar',
        length: 500,
        nullable: false
    })
    reason: string;

    // La propriété status sert à stocker le statut de la demande de congé, à partir de 
    // l'énumération LeaveStatus, avec une valeur par défaut de PENDING.
    @Column({
        type: 'simple-enum',
        enum: LeaveStatus,
        default: LeaveStatus.PENDING
    })
    status: LeaveStatus;

    // La propriété createdAt sert à stocker la date de création de la demande de congé.
    @CreateDateColumn()
    createdAt: Date;

    // La propriété updatedAt sert à stocker la date de mise à jour de la demande de congé.
    @UpdateDateColumn()
    updatedAt: Date;

    // La propriété approvedBy sert à stocker le numero d'employe de l'utilisateur qui a approuvé la demande de congé,
    @Column({ nullable: true })
    approvedBy?: string;

    // La propriété approvedAt sert à stocker la date à laquelle la demande de congé a été approuvée.
    @Column({ nullable: true })
    approvedAt?: Date;

    // Relation : plusieurs demandes peuvent appartenir à un utilisateur
    @Index()
    @ManyToOne(() => User, (user) => user.leaveRequests, {
        onDelete: 'CASCADE'
    })
    user: User;
}