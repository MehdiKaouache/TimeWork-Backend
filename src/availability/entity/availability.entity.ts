import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, Index } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';

@Entity('availabilities')
@Unique(['user', 'dayOfWeek']) // Empêche les doublons pour un même jour
export class Availability {

    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @Column({
        type: 'simple-enum',
        enum: DayOfWeek
    })
    dayOfWeek: DayOfWeek;

    @Column({ type: 'date', nullable: true })
    rangeStartDate: Date | null;

    @Column({ type: 'date', nullable: true })
    rangeEndDate: Date | null;

    @Column({
        type: 'boolean',
        default: false
    })
    isAvailable: boolean;

    @Column({ type: 'boolean', default: false })
    isAllDay: boolean;

    @Column({
        type: 'text',
        nullable: true 
    })
    startTime: string | null;

    @Column({
        type: 'text',
        nullable: true
    })
    endTime: string | null;

    @Index()
    @ManyToOne(() => User, (user) => user.availabilities, {
        onDelete: 'CASCADE' 
    })
    user: User;

    @Column()
    userId: number;
}