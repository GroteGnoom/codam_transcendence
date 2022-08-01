import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
    
@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager:true })
    sender: User;

    // @ManyToOne(() => Channel, (channel: Channel) => channel.messages)
    // channel: string;

    @Column()
    channel: string;
    
    @Column()
    text: string;

    @CreateDateColumn()
    date: Date;
}