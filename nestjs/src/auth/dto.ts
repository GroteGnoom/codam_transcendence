import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
 
export class TwoFactorAuthenticationDto {
	@IsNotEmpty()
	twoFactorAuthenticationCode: string;
}
 
export default TwoFactorAuthenticationDto;
