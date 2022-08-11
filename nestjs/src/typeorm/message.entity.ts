import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
    
@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager:true })
    sender: User;

    @Column()
    channel: string;
    
    @Column()
    text: string;

    @Column({ default: false })
    invite: boolean;

    @CreateDateColumn()
    date: Date;
}