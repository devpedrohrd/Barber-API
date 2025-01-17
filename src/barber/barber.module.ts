import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { BarberController } from './barber.controller'
import { BarberService } from './barber.service'
import { BarberSchema } from './entities/barber.entity'

@Module({
  controllers: [BarberController],
  providers: [BarberService],
  imports: [
    MongooseModule.forFeature([{ name: 'Barber', schema: BarberSchema }]),
  ],
})
export class BarberModule {}
