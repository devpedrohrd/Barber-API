import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateBarberDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @IsString()
  phone: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsOptional()
  @IsString()
  image?: string
}
