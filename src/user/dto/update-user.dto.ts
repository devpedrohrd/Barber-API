import { IsBoolean, IsEmail, IsOptional, IsString, IsIn } from 'class-validator'

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  id: string
  @IsOptional()
  @IsEmail()
  email: string
  @IsOptional()
  @IsString()
  displayName: string
  @IsOptional()
  @IsBoolean()
  isActive: boolean
  @IsOptional()
  @IsString()
  phone: string
  @IsOptional()
  @IsString()
  @IsIn(['client', 'barber', 'admin']) // Ajuste conforme sua convenção
  role?: string;
  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsString()
  avatarUrl: string
}
