import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator'

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
}
