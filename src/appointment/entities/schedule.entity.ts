import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
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

@Schema({ timestamps: true }) // Garante createdAt e updatedAt automáticos
export class BarberSchedule extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  barber: Types.ObjectId // Referência ao barbeiro que cadastrou o horário

  @Prop({
    type: [
      {
        day: {
          type: String,
          required: true,
          enum: Days,
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    default: [],
  })
  availability: { day: string; startTime: string; endTime: string }[]
}

export type BarberScheduleDTO = {
  availability: { day: Days; startTime: string; endTime: string }[]
}

export const BarberScheduleSchema = SchemaFactory.createForClass(BarberSchedule)
