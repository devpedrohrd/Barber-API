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
    example: 'pendente',
    enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
  })
  @Prop({
    required: false,
    default: 'pendente',
    enum: ['pendente', 'confirmado', 'concluido', 'cancelado'],
  })
  status: string

  @ApiProperty({
    description: 'Type of service',
    example: 'cabelo',
    enum: ['cabelo', 'barba', 'cabelo e barba'],
  })
  @Prop({
    enum: ['cabelo', 'barba', 'cabelo e barba'],
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
