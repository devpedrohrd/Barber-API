import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { AppointmentController } from './appointment.controller'
import { AppointmentService } from './appointment.service'
import { AppointmentSchema } from './entities/appointment.entity'
import { JwtService } from '@nestjs/jwt'

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, JwtService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
    ]),
  ],
})
export class AppointmentModule {}
