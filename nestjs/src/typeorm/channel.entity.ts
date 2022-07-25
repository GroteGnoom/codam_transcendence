import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';
import { User } from './user.entity';
    
@Entity()
export class Channel {
    @PrimaryColumn({ unique: true })
    name: string;
    
    @Column()
    owner: number;

    @Column("int", { array: true })
    admins: number[];

    // @Column("int", { array: true })
    // members: number[];

    @Column({ nullable: true })
    password: string;

    @Column()
    channelType: string;

    @ManyToMany(() => User, (user: User) => user.id)
    members: User[]
} 