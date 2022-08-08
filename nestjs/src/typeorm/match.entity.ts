import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
    
@Entity()
export class Match {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager:true })
    player_1: User;

    @ManyToOne(() => User, { eager:true })
    player_2: User;

    @Column()
    scoreP1: number;

    @Column()
    scoreP2: number;

    @CreateDateColumn()
    date: Date;
}