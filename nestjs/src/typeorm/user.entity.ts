import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import {DatabaseFile} from './databaseFile.entity';

export enum userStatus {
	Online = "online",
	Offline = "offline",
	InGame = "inGame",
}
@Entity()
export class User {
	@PrimaryGeneratedColumn({ // primary column will be auto-generated key
		type: 'bigint',
		name: 'user_id'
	})
	id: number;

	@Column({
		nullable: false,
		unique: true
	})
	username: string;

	@Column({
		nullable: false,
		unique: true
	})
	intraName: string;

	@Column({
		default: true
	})
  	status: userStatus;

	@Column({ default: false })
	public isSignedUp: boolean;

	@Column({ nullable: true })
	public twoFactorAuthenticationSecret?: string;
	password: string;

	@Column({ default: false })
	public isTfaEnabled: boolean;

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(
		() => DatabaseFile,
		{
		nullable: true
		}
	)
	public avatar?: DatabaseFile;
	
	@Column({ nullable: true })
	public avatarId?: number;

	@Column("int", { array: true, default: []})
    blockedUsers: number[]

    @ManyToMany(() => User)
	@JoinTable()
    friends: User[]
}
