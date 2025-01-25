import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { AppointmentModule } from 'src/appointment/appointment.module'
import { AppointmentService } from 'src/appointment/appointment.service'

import { UserSchema } from './entities/user.entity'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService],
  imports: [
    AppointmentModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  exports: [UserService],
})
export class UserModule {}
