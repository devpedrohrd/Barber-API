import { HttpException, HttpStatus, Injectable, Req, Res } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { BarberService } from 'src/barber/barber.service'

import { LoginDto } from './dto/loginBarberDTO'
import { Roles } from './dto/roles'

@Injectable()
export class AuthService {
  constructor(
    private barberService: BarberService,
    private jwtService: JwtService,
  ) {}

  async login(loginDTO: LoginDto, @Res() res: Response) {
    const { email, password } = loginDTO

    const barber = await this.barberService.validateBarber(email, password)

    const payload = {
      sub: barber.id,
      email: barber.email,
      role: Roles.BARBER,
    }

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    })

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    })

    res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 900000),
    })

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 604800000),
    })

    return res
      .status(HttpStatus.OK)
      .send({ message: 'LOGIN_SUCCESS', user: barber })
  }

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

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 900000),
      })

      res.send({ message: 'REFRESH_TOKEN_SUCCESS' })
    } catch (e) {
      console.error(e)

      throw new HttpException('REFRESH_TOKEN_INVALID', HttpStatus.UNAUTHORIZED)
    }
  }
}
