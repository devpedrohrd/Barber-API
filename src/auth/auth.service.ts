import { HttpException, HttpStatus, Injectable, Req, Res } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token']

    if (!refreshToken) {
      throw new HttpException('REFRESH_TOKEN_NOT_FOUND', HttpStatus.NOT_FOUND)
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })

      const payload = {
        email: decoded.email,
        sub: decoded.sub,
        role: decoded.role,
      }

      const newAccessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      })

      const cookie = res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 900000),
      })

      if (!cookie) {
        throw new HttpException(
          'COOKIE_NOT_SET',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      res.redirect(process.env.FRONTEND_URL)
    } catch (e) {
      console.error(e)
      throw new HttpException('REFRESH_TOKEN_INVALID', HttpStatus.UNAUTHORIZED)
    }
  }
}
