import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now()
    const request = context.switchToHttp().getRequest()
    const { method, url, ip, headers, body } = request

    this.logger.log(
      `Request: ${method} ${url} from ${ip}`,
      JSON.stringify({ headers, body }),
    )

    return next.handle().pipe(
      tap(
        (response) => {
          const responseTime = Date.now() - now
          const responseStatus = context.switchToHttp().getResponse().statusCode
          const responseBody = context.switchToHttp().getResponse().json
          this.logger.log(
            `Response: ${method} ${url} - ${responseStatus} in ${responseTime}ms`,
            JSON.stringify({ responseBody }),
          )
        },
        (error) => {
          this.logger.error(`Error: ${method} ${url}`, error.stack)
        },
      ),
    )
  }
}
