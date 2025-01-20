import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { BarberModule } from 'src/barber/barber.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  imports: [BarberModule, PassportModule],
})
export class AuthModule {}
