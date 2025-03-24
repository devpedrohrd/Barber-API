import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

enum service {
  haircut = 'haircut',
  shave = 'shave',
  haircutAndShave = 'haircut and shave',
  beardTrim = 'beard trim',
}

export class CreateAppointmentDto {
  @IsDate()
  @IsNotEmpty()
  date: Date

  @IsNotEmpty()
  @IsString()
  costumer: string

  @IsNotEmpty()
  @IsString()
  barberId: string

  @IsString()
  @IsOptional()
  status: string

  @IsEnum(service)
  @IsNotEmpty()
  service: service

  @IsBoolean()
  @IsOptional()
  isPaid: boolean
}
