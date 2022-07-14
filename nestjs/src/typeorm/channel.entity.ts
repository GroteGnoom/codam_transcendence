import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';
    
@Entity()
   export class Channel {
    @PrimaryColumn({ unique: true })
    name: string;
    
    @Column()
    owner: number;

    @Column("int", { array: true })
    admins: number[];

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[]
}