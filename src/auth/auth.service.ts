import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Req,
  Res,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request, Response } from 'express'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(user: any): Promise<any> {
    const { name, googleId, picture, email } = user

    const userExist = await this.userService.findUserByGoogleId(googleId)

    if (userExist) {
      throw new ConflictException('USER_ALREADY_EXISTS')
    }

    const userValidate = await this.userService.create({
      name,
      googleId,
      picture,
      email,
      role: 'client',
      isActive: true,
    })

    return userValidate
  }

  async login(user: any, @Res() res: Response) {
    const payload = {
      googleId: user.googleId,
      email: user.email,
      role: user.role,
    }

    await this.validateUser(user)

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    })

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 15 * 60 * 1000),
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async refresh(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies['refresh_token']

    if (!refreshToken) {
      throw new NotFoundException('REFRESH_TOKEN_NOT_FOUND')
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      })

      const payload = {
        googleId: decoded.googleId,
        email: decoded.email,
        role: decoded.role,
      }

      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      })

      return res.send({ accessToken })
    } catch (err) {
      throw new InternalServerErrorException(err.message)
    }
  }
}
