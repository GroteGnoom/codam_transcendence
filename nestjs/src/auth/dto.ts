import { IsNotEmpty } from 'class-validator';
 
export class TwoFactorAuthenticationDto {
	@IsNotEmpty()
	twoFactorAuthenticationCode: string;
}
 
export default TwoFactorAuthenticationDto;
