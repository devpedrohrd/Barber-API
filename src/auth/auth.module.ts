import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { GoogleStrategy } from './strategies/google.strategy'
import { UserService } from 'src/user/user.service'
import { PrismaService } from 'src/Config/DB/Prisma.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService,GoogleStrategy,UserService,PrismaService],
  imports: [
    PassportModule.register({
      defaultStrategy:'google'
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    })
  ]
})
export class AuthModule {}
