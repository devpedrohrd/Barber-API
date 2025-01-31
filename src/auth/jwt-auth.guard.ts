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
    private reflector: Reflector, // Acessa os metadados (roles)
    private jwtService: JwtService, // Verifica o token
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authorization = request.headers['authorization']

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new ForbiddenException('Token de autenticação ausente ou inválido')
    }

    const token = authorization.replace('Bearer ', '')
    let user: any

    try {
      user = await this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })
      request.user = user // Adiciona o usuário à requisição
    } catch (error) {
      throw new ForbiddenException('Token inválido ou expirado')
    }

    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>('role', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true // Se nenhuma role for exigida, permite acesso
    }

    if (!user.role) {
      // Alterado para verificar "role" no singular
      throw new ForbiddenException('Usuário sem permissão')
    }

    const hasRole = requiredRoles.includes(user.role) // Agora verifica "role" e não "roles"
    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado! É necessário ser ${requiredRoles.join(', ')}`,
      )
    }

    return true
  }
}
