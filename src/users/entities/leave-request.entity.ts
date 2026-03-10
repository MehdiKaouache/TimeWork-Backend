import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./user.entity";
import { LeaveStatus } from "src/common/enums/leave-status.enum";

@Entity('leave_requests')
export class LeaveRequest {

    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id: number;

    @Column({
        type: 'date',
        nullable: false
    })
    startDate: string;

    @Column({
        type: 'date',
        nullable: false
    })
    endDate: string;

    @Column({
        type: 'varchar',
        length: 500,
        nullable: false
    })
    reason: string;

    @Column({
        type: 'enum',
        enum: LeaveStatus,
        default: LeaveStatus.PENDING
    })
    status: LeaveStatus;

    @CreateDateColumn({
        type: 'timestamp'
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamp'
    })
    updatedAt: Date;

    // Relation : plusieurs demandes peuvent appartenir à un utilisateur
    // @Index()
    // @ManyToOne(() => User, (user) => user.leaveRequests, {
    //     nullable: false,
    //     onDelete: 'CASCADE'
    // })
    // user: User;
}