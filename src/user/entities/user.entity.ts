import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Roles } from 'src/auth/dto/roles'
import { ApiProperty } from '@nestjs/swagger' // Import Swagger decorators

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({ description: 'Google ID of the user', example: '1234567890' })
  @Prop({ required: true })
  googleId: string

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @Prop({ required: true })
  email: string

  @ApiProperty({ description: 'Display name of the user', example: 'John Doe' })
  @Prop({ required: true })
  displayName: string

  @ApiProperty({
    description: "URL of the user's avatar",
    example: 'https://example.com/avatar.jpg',
  })
  @Prop({ required: true })
  avatarUrl: string

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
    required: false,
  })
  @Prop({ required: false })
  isActive?: boolean

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+15551234567',
    required: false,
  })
  @Prop({ required: false })
  phone?: string

  @ApiProperty({
    description: 'Role of the user',
    example: 'USER',
    enum: Roles,
    required: false,
  }) // Use enum for Roles
  @Prop({ required: false })
  role?: Roles

  @ApiProperty({
    description: 'Description of the user',
    example: 'A brief description about the user',
    required: false,
  })
  @Prop({ required: false })
  description?: string

  @ApiProperty({
    description: "Whether it is the user's first login",
    example: true,
  })
  @Prop({ default: true })
  isFirstLogin: boolean
}

export const UserSchema = SchemaFactory.createForClass(User)

export type UserDocument = User & Document
