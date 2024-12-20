import { Module } from '@nestjs/common'
import { ServiceService } from './service.service'
import { ServiceController } from './service.controller'
import { PrismaService } from 'src/Config/DB/Prisma.service'

@Module({
  controllers: [ServiceController],
  providers: [ServiceService, PrismaService],
})
export class ServiceModule {}
