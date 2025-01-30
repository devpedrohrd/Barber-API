import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'

import { Roles } from './dto/roles'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private reflector: Reflector, //Usado para acessar os metadados como os roles
    private jwtService: JwtService, //Usado para verificar o token e extrair o payload
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>('role', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const token = request.cookies['access_token']

    if (!token) {
      throw new ForbiddenException('No token found')
    }
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })

      const userRole = decoded.role

      return requiredRoles.includes(userRole)
    } catch (error) {
      console.error(error.message)
      return false
    }
  }
}
