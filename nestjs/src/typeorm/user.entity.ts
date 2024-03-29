import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import {DatabaseFile} from './databaseFile.entity';
import { GameStats } from './gameStats.entity';

export enum userStatus {
	Online = "online",
	Offline = "offline",
	// InGame = "inGame",
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

    @OneToOne(() => GameStats, (gameStats) => gameStats.user, {cascade: true})
    @JoinColumn()
    gameStats: GameStats

	@Column({ default: false })
	inGame: boolean;
}

@Entity()
export class UserSecrets {
	@PrimaryColumn({
		type: 'bigint',
	})
	id: number

	@Column({ nullable: true })
	public twoFactorAuthenticationSecret?: string;

	@Column({ nullable: true })
	public tmpTfaSecret?: string;
}
