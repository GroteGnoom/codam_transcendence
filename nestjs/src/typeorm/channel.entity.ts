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

    //members

    // @OneToMany(() => Message, (message: Message) => message.channel)
    // messages: Message[]
}