import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entity/user.entity";

@Entity('company_job_roles')
export class CompanyJobRole {

    // --- Basic Info --- //

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string; // e.g., "waiter", "chef", "cook"

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    baseHourlyRate: number;

    // --- Staffing Needs per Day --- //

    // How many people with this role are needed per day?
    // JSON: { "monday": 3, "tuesday": 3, "friday": 5 }
    @Column({ type: 'simple-json' })
    staffingNeedsPerDay: Record<string, number>;

    // --- Relations --- //

    // Each role can be assigned to many users
    @OneToMany(() => User, (user) => user.jobRole)
    users: User[];
}