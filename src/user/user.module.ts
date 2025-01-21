import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from './entities/user.entity'
import { JwtService } from '@nestjs/jwt'

@Module({
  controllers: [UserController],
  providers: [UserService, JwtService],
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  exports: [UserService],
})
export class UserModule {}
