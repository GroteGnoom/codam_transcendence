import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany, ManyToOne, JoinTable, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
    
@Entity()
export class Channel {
    @PrimaryColumn({ unique: true })
    name: string;
    
    @Column()
    owner: number;

    @Column({ nullable: true })
    password: string;

    @Column()
    channelType: string;

    @OneToMany(() => ChannelMember, (member: ChannelMember) => member.channel, {
        cascade: true // cascade will update all changes in this array into the ChannelMember table
    })
    members: ChannelMember[]

    @ManyToMany(() => User)
    @JoinTable()
    admins: User[]
} 

@Entity()
export class ChannelMember {
	@PrimaryGeneratedColumn()
	id: number;

    @Column({ default: false })
    isMuted: boolean;

    @Column({ nullable: true })
    mutedUntil: Date;

    @ManyToOne(() => User, {
        eager:true // eager will automatically join the user from the user table on find operations, no need to define 'relations'
    })
    user: User;

    @ManyToOne(() => Channel, (channel: Channel) => channel.members)
    channel: Channel;
}