import { Entity, Index, OneToMany,  PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Shift } from 'src/shift/entity/shift.entity';

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

    @OneToMany(() => Shift, (shift) => shift.schedule, {
    })
    shifts: Shift[];
}