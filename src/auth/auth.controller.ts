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
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const { jwtAccessToken, jwtRefreshToken, user, isFirstLogin } =
      req.user as any

    res.setHeader('Authorization', `Bearer ${jwtAccessToken}`)
    res.setHeader('X-Refresh-Token', jwtRefreshToken)

    // res.json({
    //   message: 'Login com Google realizado com sucesso',
    //   jwtAccessToken,
    //   jwtRefreshToken,
    //   isFirstLogin,
    //   role: user.role,
    // })

    const frontendUrl = new URL(process.env.FRONTEND_URL)

    const redirectUrl = new URL('/login/callback', frontendUrl)
    redirectUrl.searchParams.append('access_token', jwtAccessToken)
    redirectUrl.searchParams.append('refresh_token', jwtRefreshToken)
    redirectUrl.searchParams.append('is_first_login', String(isFirstLogin))
    redirectUrl.searchParams.append('role', user.role)

    return res.redirect(redirectUrl.toString())
  }
}
