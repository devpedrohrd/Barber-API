import { BarberController } from './barber.controller'
import { BarberService } from './barber.service'
import { BarberSchema } from './entities/barber.entity'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  controllers: [BarberController],
  providers: [BarberService],
  imports: [
    MongooseModule.forFeature([{ name: 'Barber', schema: BarberSchema }]),
  ],
  exports: [BarberService],
})
export class BarberModule {}
