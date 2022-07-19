import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
    
@Entity()
export class Channel {
    @PrimaryColumn({ unique: true })
    name: string;
    
    @Column()
    owner: number;

    @Column("int", { array: true })
    admins: number[];

    @Column("int", { array: true })
    members: number[];

    @Column({ nullable: true })
    password: string;

    // @OneToMany(() => Message, (message: Message) => message.channel)
    // messages: Message[]
} 