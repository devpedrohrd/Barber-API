import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name)
  private cache = new Map<string, any>()

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const method = request.method
    const key = this.generateCacheKey(request)

    if (method === 'GET') {
      if (this.cache.has(key)) {
        this.logger.log(`Cache hit for key "${key}"`)
        return new Observable((observer) => {
          observer.next(this.cache.get(key))
          observer.complete()
        })
      }

      return next.handle().pipe(
        map((response) => {
          this.logger.log(`Cache miss for key "${key}"`)
          this.cache.set(key, response)
          return response
        }),
      )
    } else if (method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      if (this.cache.has(key)) {
        this.cache.delete(key)
        this.logger.log(`Cache invalidated for key "${key}"`)
      }
      return next.handle()
    } else {
      return next.handle()
    }
  }

  private generateCacheKey(request: any): string {
    const { method, url } = request
    return `${method}:${url}`
  }
}
