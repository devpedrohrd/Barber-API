import { LoginDto } from './dto/loginBarberDTO'
import { Roles } from './dto/roles'
import { MailerService } from '@nestjs-modules/mailer'
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { BarberService } from 'src/barber/barber.service'

@Injectable()
export class AuthService {
  constructor(
    private barberService: BarberService,
    private jwtService: JwtService,
    private mailerService: MailerService,
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

  async sendLinkToResetPassword(email: string) {
    const barber = await this.barberService.findBarberByEmail(email)

    if (!barber) {
      throw new NotFoundException('BARBER_NOT_FOUND')
    }

    const payload = {
      sub: barber.id,
      email: barber.email,
      role: Roles.BARBER,
    }

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_RESET_SECRET,
      expiresIn: '15m',
    })

    const url = `http://localhost:3000/auth/reset-password?token=${token}`

    await this.mailerService.sendMail({
      to: barber.email,
      subject: 'Solicitação de Redefinição de Senha',
      template: './reset-password',
      context: {
        name: barber.name,
        url,
      },
      text: `Olá ${barber.name},\n\nRecebemos uma solicitação para redefinir sua senha. Por favor, clique no link abaixo para redefinir sua senha:\n\n${url}\n\nSe você não solicitou a redefinição de senha, por favor ignore este email.\n\nObrigado,\nEquipe Barber Shop`,
    })

    return token
  }

  async resetPasswordWithToken(props: {
    token: string
    password: string
    response: Response
  }) {
    let decoded
    try {
      decoded = this.jwtService.verify(props.token, {
        secret: process.env.JWT_RESET_SECRET,
      })
    } catch (e) {
      throw new HttpException(
        'INVALID_OR_EXPIRED_TOKEN',
        HttpStatus.UNAUTHORIZED,
      )
    }

    const barber = await this.barberService.findBarberByEmail(decoded.email)

    if (!barber) {
      throw new NotFoundException('BARBER_NOT_FOUND')
    }

    barber.password = await bcrypt.hash(props.password.toString(), 10)

    await this.barberService.update(barber.id, barber)

    return props.response
      .status(HttpStatus.OK)
      .send({ message: 'PASSWORD_RESET_SUCCESS' })
  }
}
