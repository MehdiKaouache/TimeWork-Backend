import { Exclude } from "class-transformer";
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
    RelationId 
} from "typeorm";

// Imports

import { UserRole } from "src/common/enums/user-roles.enum";
import { UserStatus } from "src/common/enums/user-status.enum";
import { Company } from "../../company/entity/company.entity";
import { CompanyJobRole } from "../../company/entity/company-job-role.entity";
import { Shift } from "../../shift/entity/shift.entity";
import { LeaveRequest } from "../../leave-request/entity/leave-request.entity";
import { Availability } from "../../availability/entity/availability.entity";

/**
 * Represents a system user (Employee or Manager) within a specific Company.
 */
@Entity('users')
export class User {
    
    // --- Basic Info --- //

    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 15, nullable: false })
    employeeNumber: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    firstName: string;

    @Column({ type: 'varchar', length: 100, nullable: false })
    lastName: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255, nullable: false })
    email: string;

    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: false })
    password: string;
    
    @Column({ type: 'varchar', length: 20, nullable: false })
    phoneNumber: string;

    // --- Security & Tokens ---

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    refreshToken: string | null;

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    passwordResetToken: string | null;

    @Column({ type: 'datetime', nullable: true })
    passwordResetExpiresAt: Date | null;

    // --- Permissions & Status ---

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.NEW_HIRE,
    })
    role: UserRole; // Internal System Role (ADMIN, MANAGER, EMPLOYEE)
    
    @Column({
        type: 'simple-enum',
        enum: UserStatus,
        default: UserStatus.PENDING,
    })
    status: UserStatus;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    // --- Finance & HR ---

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value) || 0
        }
    })
    hourlyRate: number;

    @Column({ type: 'datetime', nullable: true })
    approvedAt: Date | null;

    // --- Relations ---

    // Audit: Who approved this user?
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'approved_by_id' })
    approvedBy: User | null;

    @RelationId((user: User) => user.approvedBy)
    approvedById: number | null;

    // Multi-Tenancy: Which company owns this user?
    @ManyToOne(() => Company, (company) => company.users, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @RelationId((user: User) => user.company)
    companyId: number;

    // Job Logic: What specific role (Loadout) do they fulfill?
    @ManyToOne(() => CompanyJobRole, (jobRole) => jobRole.users, { nullable: true })
    @JoinColumn({ name: 'job_role_id' })
    jobRole: CompanyJobRole;

    @RelationId((user: User) => user.jobRole)
    jobRoleId: number | null;

    // Operations
    @OneToMany(() => Shift, (shift) => shift.user)
    shifts: Shift[];

    @OneToMany(() => Availability, (availability) => availability.user)
    availabilities: Availability[];
    
    @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.user)
    leaveRequests: LeaveRequest[];

    // --- Audit ---

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date | null;

    // --- Hooks ---

    @BeforeInsert()
    @BeforeUpdate()
    normalizeEmail() {
        if (this.email) {
            this.email = this.email.toLowerCase().trim();
        }
    }

    @BeforeInsert()
    setInitialHourlyRate() {
        if (this.jobRole && (!this.hourlyRate || this.hourlyRate === 0)) {
            this.hourlyRate = this.jobRole.baseHourlyRate;
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
}