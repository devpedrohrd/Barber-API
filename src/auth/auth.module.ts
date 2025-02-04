import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleStrategy } from './strategies/google.strategy'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, GoogleStrategy],
  imports: [PassportModule, UserModule, ConfigModule.forRoot()],
})
export class AuthModule {}
