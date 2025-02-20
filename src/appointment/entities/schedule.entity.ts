import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Type } from 'class-transformer'
import { IsArray, IsDate } from 'class-validator'
import { Document, Types } from 'mongoose'

enum Days {
  SUNDAY = 'domingo',
  MONDAY = 'segunda',
  TUESDAY = 'terça',
  WEDNESDAY = 'quarta',
  THURSDAY = 'quinta',
  FRIDAY = 'sexta',
  SATURDAY = 'sábado',
}

@Schema({ timestamps: true })
export class BarberSchedule extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  barber: Types.ObjectId

  @Prop({ required: true })
  availability: Date[]
}

export class BarberScheduleDTO {
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  availability: Date[]
}

export const BarberScheduleSchema = SchemaFactory.createForClass(BarberSchedule)
