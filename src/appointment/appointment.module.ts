import { AppointmentController } from './appointment.controller'
import { AppointmentService } from './appointment.service'
import { AppointmentSchema } from './entities/appointment.entity'
import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/user/entities/user.entity'
import { BarberScheduleSchema } from './entities/schedule.entity'
import { RedisCacheService } from 'src/utils/cacheConnection'

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, JwtService, RedisCacheService],
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
      { name: 'User', schema: UserSchema },
      { name: 'BarberSchedule', schema: BarberScheduleSchema },
    ]),
  ],
  exports: [AppointmentService, MongooseModule],
})
export class AppointmentModule { }
