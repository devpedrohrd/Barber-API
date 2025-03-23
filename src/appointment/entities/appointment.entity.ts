import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema({ timestamps: true })
export class Appointment extends Document {
  @ApiProperty({
    description: 'Date and time of the appointment',
    example: '2024-03-15T10:00:00.000Z',
  })
  @Prop({ required: true })
  date: Date

  @ApiProperty({
    description: 'ID of the customer',
    example: '6543210987abcdef01234567',
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  costumer: Types.ObjectId

  @ApiProperty({
    description: 'ID of the barber',
    example: '6543210987abcdef01234568',
  })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  barberId: Types.ObjectId

  @ApiProperty({
    description: 'Status of the appointment',
    example: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @Prop({
    required: false,
    default: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  status: string

  @ApiProperty({
    description: 'Type of service',
    example: 'haircut',
    enum: ['haircut', 'shave', 'haircut and shave', 'beard trim'],
  })
  @Prop({
    enum: ['haircut', 'shave', 'haircut and shave', 'beard trim'],
    required: true,
  })
  service: string

  @ApiProperty({
    description: 'Whether the appointment has been paid for',
    example: false,
  })
  @Prop({ required: false, default: false, type: Boolean })
  isPaid: boolean
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment)

export type AppointmentDocument = Appointment & Document
