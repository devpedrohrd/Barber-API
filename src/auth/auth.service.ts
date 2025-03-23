import { Injectable, Req, Res, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  private generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    })

    return { accessToken, refreshToken }
  }

  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const oldRefreshToken = req.headers['x-refresh-token'] as string

      if (!oldRefreshToken) {
        throw new UnauthorizedException('Refresh token não encontrado')
      }

      const payload = this.jwtService.verify(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })

      const { accessToken, refreshToken } = this.generateTokens({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        displayName: payload.displayName,
      })

      return res.json({
        accessToken,
        refreshToken,
      })
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }
  }
}
