import { Exclude } from "class-transformer";
import { Shift } from "../../shift/entities/shift.entity";
import { UserRole } from "src/common/enums/user-roles.enum";
import { UserStatus } from "src/common/enums/user-status.enum";
import { LeaveRequest } from "../../leave-request/entities/leave-request.entity";
import { Availability } from "../../availability/entities/availability.entity";
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
} from "typeorm"

/**
 * Represents a system user (Employee or Manager).
 * Includes authentication data, organizational roles, and scheduling relations.
 */
@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    /**
     * Unique identifier for employees (e.g., EMP12345).
     * Generated automatically before insertion based on the user's role.
     */
    @Index({ unique: true })
    @Column({
        type: 'varchar', 
        length: 12,  
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

    /**
     * Unique email address used for authentication.
     * Normalized to lowercase via entity hooks.
     */
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

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    passwordResetToken: string | null;

    @Column({ type: 'datetime', nullable: true })
    passwordResetExpiresAt: Date | null;

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.NEW_HIRE,
        nullable: false
     })
    role: UserRole;
    
    @Column({
        type: 'simple-enum',
        enum: UserStatus,
        default: UserStatus.PENDING,
        nullable: false
    })
    status: UserStatus;

    @Column({
        type: 'boolean', 
        default: false,
        nullable: false
    })
    isActive: boolean;

    /**
     * Financial rate per hour. 
     * Uses a transformer to ensure values are treated as numbers in JS.
     */
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        nullable: false,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    hourlyRate: number;

    @Column({ nullable: true })
    approvedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    refreshToken: string | null;

    // --- Hooks ---

    /**
     * Normalizes the email to lowercase and trims whitespace before persistence.
     */
    @BeforeInsert()
    @BeforeUpdate()
    normalizeEmail() {
        if (this.email) {
            this.email = this.email.toLowerCase().trim();
        }
    }

    /**
     * Set default hourly rate based 
     */
    @BeforeInsert()
    setInitialHourlyRate() {
        // Only set the default if hourlyRate is 0 or not provided
        if (!this.hourlyRate || this.hourlyRate === 0) {
            this.hourlyRate = DEFAULT_ROLE_SALARY[this.role] || 0;
        }
    }

    /**
     * Generates a unique employee number based on the assigned role and current timestamp.
     */
    @BeforeInsert()
    generateEmployeeNumber() {
        const timePart = Date.now().toString().slice(-5);
        const randomPart = Math.floor(100 + Math.random() * 900);

        switch (this.role) {
            case UserRole.MANAGER:
                this.employeeNumber = `MAN${timePart}${randomPart}`;
                break;
            case UserRole.ASSISTANT_MANAGER:
                this.employeeNumber = `ASM${timePart}${randomPart}`;
                break;
            default:
                this.employeeNumber = `EMP${timePart}${randomPart}`;
        }  
    }


    // --- Relations ---

    /**
     * The Manager who approved this user's account.
     */
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'approved_by_id' })
    approvedBy?: User;


    @OneToMany(() => Shift, (shift) => shift.user)
    shifts: Shift[];

    @OneToMany(() => Availability, (availability) => availability.user)
    availabilities: Availability[];
    
    @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
    leaveRequests: LeaveRequest[];
}