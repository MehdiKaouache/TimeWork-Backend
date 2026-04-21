import { Exclude } from "class-transformer";
import { Shift } from "../../shift/entity/shift.entity";
import { UserRole } from "src/common/enums/user-roles.enum";
import { UserStatus } from "src/common/enums/user-status.enum";
import { LeaveRequest } from "../../leave-request/entity/leave-request.entity";
import { Availability } from "../../availability/entity/availability.entity";
import { DEFAULT_ROLE_SALARY } from "src/common/constants/default-role-salary";

import { 
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Index,
    RelationId,
} from "typeorm"

/**
 * Represents a system user (Employee or Manager).
 * Optimized for SQLite and NestJS Authentication.
 */
@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Index({ unique: true })
    @Column({
        type: 'varchar', 
        length: 15,  
        nullable: false
    })
    employeeNumber: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    firstName: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false
    })
    lastName: string;

    @Index({ unique: true })
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false
    })
    email: string;

    @Exclude()
    @Column({
        type: 'varchar',
        length:255,
        nullable: false
    })
    password: string;
    
    // --- Security & Tokens --- //
    
    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    refreshToken: string | null;

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    passwordResetToken: string | null;

    @Column({ type: 'datetime', nullable: true })
    passwordResetExpiresAt: Date | null;

    // --- Statuts & Roles ---//

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.NEW_HIRE,
    })
    role: UserRole;
    
    @Column({
        type: 'simple-enum',
        enum: UserStatus,
        default: UserStatus.PENDING,
    })
    status: UserStatus;

    @Column({
        type: 'boolean', 
        default: false,
        nullable: false
    })
    isActive: boolean;

    // --- RH & Paye --- //

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        nullable: false,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value) || 0
        }
    })
    hourlyRate: number;

    @Column({ type: 'varchar', nullable: true})
    phoneNumber: string;

    @Column({ type:'datetime', nullable: true })
    approvedAt: Date | null;

    @RelationId((user: User) => user.approvedBy)
    approvedById: number | null;

    // --- Audit --- //

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date | null;


    // --- Hooks --- //

    @BeforeInsert()
    @BeforeUpdate()
    normalizeEmail() {
        if (this.email) {
            this.email = this.email.toLowerCase().trim();
        }
    }

    @BeforeInsert()
    setInitialHourlyRate() {
        if (!this.hourlyRate || this.hourlyRate === 0) {
            this.hourlyRate = DEFAULT_ROLE_SALARY[this.role] || 0;
        }
    }

    @BeforeInsert()
    generateEmployeeNumber() {
        if (!this.employeeNumber) {
            const timePart = Date.now().toString().slice(-5);
            const randomPart = Math.floor(100 + Math.random() * 900);
            const prefix = this.role === UserRole.MANAGER ? 'MAN' :
                this.role === UserRole.ASSISTANT_MANAGER ? 'ASM' : 'EMP';

            this.employeeNumber = `${prefix}${timePart}${randomPart}`;        
        }
    }


    // --- Relations --- //

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'approved_by_id' })
    approvedBy: User | null;


    @OneToMany(() => Shift, (shift) => shift.user)
    shifts: Shift[];

    @OneToMany(() => Availability, (availability) => availability.user)
    availabilities: Availability[];
    
    @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
    leaveRequests: LeaveRequest[];
}