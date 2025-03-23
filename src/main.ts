import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import * as dotenv from 'dotenv'
import helmet from 'helmet'

import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { LoggerInterceptor } from './interceptor/logger/logger.interceptor'
import { CacheInterceptor } from './interceptor/cache/cache.interceptor'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  app.use(helmet())
  app.use(cookieParser())

  dotenv.config()

  const config = new DocumentBuilder()
    .setTitle('Barber API')
    .setDescription('The Barber API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api', app, document)

  app.useGlobalInterceptors(new LoggerInterceptor(), new CacheInterceptor())

  app.enableCors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token'],
  })

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
