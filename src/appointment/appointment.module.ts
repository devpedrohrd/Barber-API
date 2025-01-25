import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'

import { AppointmentController } from './appointment.controller'
import { AppointmentService } from './appointment.service'
import { AppointmentSchema } from './entities/appointment.entity'

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, JwtService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
    ]),
  ],
  exports: [AppointmentService, MongooseModule],
})
export class AppointmentModule {}
