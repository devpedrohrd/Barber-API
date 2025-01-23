import { AuthService } from './auth.service'
import { LoginDto } from './dto/loginBarberDTO'
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDTO: LoginDto, @Res() res: Response) {
    return await this.authService.login(loginDTO, res)
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res)
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { user, jwtAccessToken, jwtRefreshToken } = req.user

    res.cookie('access_token', jwtAccessToken, {
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 900000),
    })

    res.cookie('refresh_token', jwtRefreshToken, {
      httpOnly: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 604800000),
    })

    return res.status(200).send({ message: 'LOGIN_SUCCESS', user })
  }

  @Post('link-to-reset-password')
  async resetPassword(@Body() body: { email: string }) {
    return this.authService.sendLinkToResetPassword(body.email)
  }

  @Post('reset-password')
  async resetPasswordWithToken(
    @Query('token') token: string,
    @Body() password: string,
    @Res() response: Response,
  ) {
    const props = { token, password, response }

    return this.authService.resetPasswordWithToken(props)
  }
}
