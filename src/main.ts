import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as dotenv from 'dotenv'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  dotenv.config()

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  await app.listen(3000)
}
bootstrap()
