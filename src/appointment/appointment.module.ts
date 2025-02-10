import { AppointmentController } from './appointment.controller'
import { AppointmentService } from './appointment.service'
import { AppointmentSchema } from './entities/appointment.entity'
import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/user/entities/user.entity'

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, JwtService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  exports: [AppointmentService, MongooseModule],
})
export class AppointmentModule {}
