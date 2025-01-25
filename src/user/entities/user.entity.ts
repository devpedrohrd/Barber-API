import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Roles } from 'src/auth/dto/roles'

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  googleId: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  displayName: string

  @Prop({ required: true })
  avatarUrl: string

  @Prop({ required: false })
  isActive?: boolean

  @Prop({ required: false })
  phone?: string

  @Prop({ required: false })
  role?: Roles

  @Prop({ required: false })
  description?: string
}

export const UserSchema = SchemaFactory.createForClass(User)

export type UserDocument = User & Document
