import { $Enums, User } from '@prisma/client'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateUserDto implements User {
  @IsString()
  @IsNotEmpty()
  name: string
  @IsInt()
  @IsOptional()
  id: number
  @IsEmail()
  @IsNotEmpty()
  email: string
  @IsString()
  @IsOptional()
  googleId: string
  @IsString()
  @IsOptional()
  picture: string
  @IsString()
  @IsEnum($Enums.Role)
  role: $Enums.Role
  @IsBoolean()
  @IsOptional()
  isActive: boolean
  @IsDate()
  @IsOptional()
  createdAt: Date
  @IsDate()
  @IsOptional()
  updatedAt: Date
}
