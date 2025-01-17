import { CreateBarberDto } from './create-barber.dto'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateBarberDto extends PartialType(CreateBarberDto) {}
