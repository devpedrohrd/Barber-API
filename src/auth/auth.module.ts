import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { BarberModule } from 'src/barber/barber.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleStrategy } from './strategies/google.strategy'
import { UserModule } from 'src/user/user.module'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, GoogleStrategy],
  imports: [BarberModule, PassportModule, UserModule],
})
export class AuthModule {}
