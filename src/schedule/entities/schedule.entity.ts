import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    weekNumber: number;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: false })
    isPublished: boolean;

    /*@OneToMany(() => Shift, (shift) => shift.schedule, { cascade: true })
    shifts: Shift[];*/
}