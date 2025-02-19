import { createClient } from 'redis'
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private redisClient: ReturnType<typeof createClient>

  constructor(private readonly config: ConfigService) {
    this.redisClient = createClient({
      username: this.config.get<string>('REDIS_USERNAME'),
      password: this.config.get<string>('REDIS_PASSWORD'),
      socket: {
        host: this.config.get<string>('REDIS_HOST'),
        port: parseInt(this.config.get<string>('REDIS_PORT'), 10),
      },
    });

    this.redisClient.on('error', (err) =>
      console.error('Redis Client Error', err),
    );
  }


  async onModuleInit() {
    try {
      await this.redisClient.connect()
      console.log('Redis client connected')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit()
      console.log('Redis client disconnected')
    }
  }

  async get(key: string): Promise<any> {
    try {
      const cachedValue = await this.redisClient.get(key)
      if (cachedValue) {
        return JSON.parse(cachedValue)
      }
      return null
    } catch (error) {
      console.error(`Error getting key "${key}" from Redis:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const valueToCache = JSON.stringify(value)
      if (ttl) {
        await this.redisClient.set(key, valueToCache, { EX: ttl }) // Define o tempo de vida (TTL) em segundos
      } else {
        await this.redisClient.set(key, valueToCache)
      }
    } catch (error) {
      console.error(`Error setting key "${key}" in Redis:`, error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key)
    } catch (error) {
      console.error(`Error deleting key "${key}" from Redis:`, error)
    }
  }
}
