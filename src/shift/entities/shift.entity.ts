import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';
// import { Schedule } from '../../schedule/entities/schedule.entity';

@Entity('shifts')
export class Shift {

    // La propriété id sert à stocker l'identifiant unique de chaque shift dans la base de données.
    @PrimaryGeneratedColumn({
        type: 'int',
        })
    id: number;

    // La propriété date sert à stocker la date du shift.
    @Index()
    @Column({
        type: 'date',
        nullable: false,
    })
    date: Date;

    // La propriété startTime sert à stocker l'heure de début du shift.
    @Column({
        type: 'text',
        nullable: false,
    })
    startTime: string;

    // La propriété endTime sert à stocker l'heure de fin du shift.
    @Column({

        type: 'text',
        nullable: false,
    })
    endTime: string;

    // Relation ManyToOne : plusieurs shifts peuvent appartenir à un seul utilisateur
    @Index()
    @ManyToOne(() => User, (user) => user.shifts, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    user: User;

    // // Relation ManyToOne : plusieurs shifts peuvent appartenir à un seul schedule
    // @Index()
    // @ManyToOne(() => Schedule, (schedule) => schedule.shifts, {
    //     nullable: false,
    //     onDelete: 'CASCADE',
    // })
    // schedule: Schedule;



}
