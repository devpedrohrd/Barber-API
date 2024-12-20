import { $Enums, Appointment } from '@prisma/client'
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateAppointmentDto implements Appointment {
  @IsInt()
  @IsOptional()
  id: number
  @IsDate()
  @IsOptional()
  date: Date
  @IsEnum($Enums.AppointmentStatus)
  @IsOptional()
  status: $Enums.AppointmentStatus
  @IsDate()
  @IsOptional()
  createdAt: Date
  @IsDate()
  @IsOptional()
  updatedAt: Date
  @IsInt()
  @IsNotEmpty()
  userClientId: number
  @IsInt()
  @IsNotEmpty()
  userBarberId: number
  @IsInt()
  @IsNotEmpty()
  serviceId: number
}
