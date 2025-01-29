import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res)
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { jwtAccessToken, jwtRefreshToken } = req.user

    res.cookie('access_token', jwtAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    res.cookie('refresh_token', jwtRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    res.redirect(process.env.FRONTEND_URL)
  }
}
