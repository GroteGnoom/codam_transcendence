import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

	@Column({
		nullable: false,
		default: '',
	})

	@Column({ nullable: true })
	public twoFactorAuthenticationSecret?: string;
	password: string;

	@Column({ default: false })
	public isTfaEnabled: boolean;
}
