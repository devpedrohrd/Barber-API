import { $Enums, Service } from '@prisma/client'
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsInt,
  IsDate,
} from 'class-validator'

export class CreateServiceDto implements Service {
  @IsString()
  @IsNotEmpty()
  name: $Enums.ServiceType
  @IsInt()
  @IsOptional()
  id: number
  @IsNumber()
  @IsNotEmpty()
  price: number
  @IsNumber()
  @IsNotEmpty()
  duration: number
  @IsString()
  @IsNotEmpty()
  description: string
  @IsOptional()
  @IsDate()
  createdAt: Date
  @IsOptional()
  @IsDate()
  updatedAt: Date
}
