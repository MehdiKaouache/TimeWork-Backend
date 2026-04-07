import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('schedules')
export class Schedule {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true })
    weekNumber: number;

    @Column({ type: 'date' })
    startDate: Date;

    @Column({ type: 'date' })
    endDate: Date;
}