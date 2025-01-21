import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

@Schema({ timestamps: true })
export class Appointment extends Document {
  @Prop({ required: true })
  date: Date

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  costumer: Types.ObjectId

  @Prop({ required: true, type: Types.ObjectId, ref: 'Barber' })
  barberId: Types.ObjectId

  @Prop({
    required: false,
    default: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  status: string

  @Prop({
    enum: ['haircut', 'shave', 'haircut and shave', 'beard trim'],
    required: true,
  })
  service: string

  @Prop({ required: false, default: false, type: Boolean })
  isPaid: boolean
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)

export type AppointmentDocument = Appointment & Document
