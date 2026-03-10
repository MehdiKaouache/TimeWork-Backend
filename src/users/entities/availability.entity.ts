import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, BeforeInsert, BeforeUpdate, In, Index } from 'typeorm';
import { User } from './user.entity';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';

@Entity('availabilities')
@Unique(['user', 'dayOfWeek']) // empêche deux fois le même jour
export class Availability {

    @PrimaryGeneratedColumn({
        type : 'int'
    })
    id: number;

    @Column({
        type : 'enum',
        enum : DayOfWeek
    })
    dayOfWeek: DayOfWeek;

    @Column({
        type : 'boolean',
        default: false
    })
    isAvailable : boolean;

    @Column({
         type: 'time',
          nullable: true 
    })
    startTime: string | null;

    @Column({
         type: 'time',
          nullable: true
    })
    endTime: string | null;

    // Relation ManyToOne : plusieurs disponibilités peuvent appartenir à un seul utilisateur
    // @Index()
    // @ManyToOne(() => User, (user) => user.availabilities , {
    //     nullable : false,
    //     onDelete: 'CASCADE' 
    // })
    // user: User;
}