import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, BeforeInsert, BeforeUpdate, In, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';

// L'entité Availability représente la disponibilité d'un utilisateur pour chaque jour de la semaine, 
// avec des propriétés telles que l'identifiant unique, le jour de la semaine, les heures de début et de fin, 
// ainsi que la relation avec l'entité User qui permet d'associer une disponibilité à un utilisateur. 
// Elle inclut également une contrainte d'unicité pour empêcher qu'un utilisateur ait plusieurs disponibilités 
// pour le même jour de la semaine. Elle sera mis a jour de maniere trimestrielle par les utilisateurs.

@Entity('availabilities')
@Unique(['user', 'dayOfWeek']) // empêche deux fois le même jour
export class Availability {

    // La propriété id sert à stocker l'identifiant unique de chaque disponibilité dans la base de données.
    @PrimaryGeneratedColumn({
        type : 'int'
    })
    id: number;

    // La propriété dayOfWeek sert à stocker le jour de la semaine pour lequel 
    // la disponibilité est définie, à partir de l'énumération DayOfWeek.
    @Column({
        type : 'simple-enum',
        enum : DayOfWeek
    })
    dayOfWeek: DayOfWeek;

    // La propriété isAvailable sert à indiquer si l'utilisateur est 
    // disponible ou non pour le jour de la semaine spécifié.
    @Column({
        type : 'boolean',
        default: false
    })
    isAvailable : boolean;

    // La propriété isAllDay sert à indiquer si l'utilisateur est disponible toute la journée pour le jour de la semaine spécifié.
    @Column({ default: false })
    isAllDay: boolean;

    // La propriété startTime sert à stocker l'heure de début de la disponibilité pour le jour de la semaine spécifié.
    // Elle est de type time et peut être nulle si l'utilisateur n'est pas disponible ce jour-là.
    @Column({
        type: 'text',
        nullable: true 
    })
    startTime: string | null;

    // La propriété endTime sert à stocker l'heure de fin de la disponibilité pour le jour de la semaine spécifié.
    // Elle est de type time et peut être nulle si l'utilisateur n'est pas disponible ce jour-là.
    @Column({
        type: 'text',
        nullable: true
    })
    endTime: string | null;

    // Relation ManyToOne : plusieurs disponibilités peuvent appartenir à un seul utilisateur
    @Index()
    @ManyToOne(() => User, (user) => user.availabilities , {
        onDelete: 'CASCADE' 
    })
    user: User;
}