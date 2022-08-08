import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class GameStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 }) // initializes at 0
    wins: number;

    @Column({ default: 0 })
    losses: number;

    @OneToOne(() => User, (user) => user.gameStats)
    user: User;
}