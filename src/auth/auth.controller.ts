import { Body, Controller, Post, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/loginBarberDTO'

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
}
