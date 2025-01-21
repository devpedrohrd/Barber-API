import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest()
      const token = (request.headers['authorization'] as string).replace(
        new RegExp(/Bearer /gi),
        '',
      )
      if (!token) {
        return false
      }
      try {
        const user = await this.jwtService.verify(token, {
          secret: process.env.JWT_ACCESS_SECRET,
        })
        request.user = user
        const requiredRoles = this.reflector.get('role', context.getHandler())
        return user.roles.some((el) => requiredRoles.includes(el))
      } catch (error) {
        return false
      }
    } catch (error) {
      console.error(error.message)
      return false
    }
  }
}
