import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, Index, DeleteDateColumn } from 'typeorm';
import { User } from "src/users/entity/user.entity";
import { CompanyJobRole } from './company-job-role.entity';

@Entity('companies')
export class Company {

    // --- Basic Info --- //

    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 25, unique: true })
    companyCode: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phoneNumber: string;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;
    
    @Column({ type: 'boolean', default: false })
    isDeleted: boolean;

    @DeleteDateColumn()
    deletedAt: Date; 

    // --- Operating Hours --- //

    // Stores JSON like: { monday: { open: "08:00", close: "22:00" }, ... }
    @Column({ type: 'simple-json' })
    operatingHours: Record<string, { open: string; close: string; }>;

    // --- Relations --- //

    @OneToMany(() => User, (user) => user.company)
    users: User[];

    @OneToMany(() => CompanyJobRole, (jobRole) => jobRole.company)
    jobRoles: CompanyJobRole[];

    // --- Hooks --- //
    
    @BeforeInsert()
    generateCode() {
        const prefix = this.name.toUpperCase().replace(/\s/g, '').substring(0, 3);
        this.companyCode = `${prefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    }
}