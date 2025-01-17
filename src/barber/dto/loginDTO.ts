import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator'

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
  @IsNotEmpty()
  @IsStrongPassword()
  password: string
}
