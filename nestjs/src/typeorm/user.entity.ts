import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
		default: '',
	})
	intraName: string;

	@Column({ default: true })
  	isActive: boolean;
	@Column({
		nullable: false,
		default: '',
	})

	@Column({ nullable: true })
	public twoFactorAuthenticationSecret?: string;
	password: string;

	@Column({ default: false })
	public isTwoFactorAuthenticationEnabled: boolean;
}
