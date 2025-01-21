import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

import { AuthModule } from './auth/auth.module'
import { BarberModule } from './barber/barber.module'
import { UserModule } from './user/user.module';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.on('error', (err: Error) => {
            console.error('MongoDB Connection Error:', err)
          })
          return connection
        },
      }),
    }),
    AuthModule,
    BarberModule,
    UserModule,
    AppointmentModule,
  ],
})
export class AppModule {}
