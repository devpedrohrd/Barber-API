import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Barber extends Document {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true })
  password: string

  @Prop({ required: false })
  image: string
}

export const BarberSchema = SchemaFactory.createForClass(Barber)
