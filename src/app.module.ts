import { Module } from '@nestjs/common'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { ServiceModule } from './services/service.module'
import { AppointmentModule } from './appointment/appointment.module'

@Module({
  imports: [UserModule, AuthModule, ServiceModule, AppointmentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
