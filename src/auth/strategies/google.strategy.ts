import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { UserService } from 'src/user/user.service'

import { Roles } from '../dto/roles'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, displayName, emails, photos } = profile

    let user = await this.userService.findOnCreate({
      googleId: id,
      email: emails[0].value,
      displayName,
      avatarUrl: photos[0].value || 'default-avatar-url',
      role: Roles.CLIENT,
      phone: '',
      description: '',
    })

    let isFirstLogin = user.isFirstLogin

    if (isFirstLogin) {
      user = await this.userService.markFirstLoginCompleted(user.googleId)
      isFirstLogin = user.isFirstLogin
    }

    const payload = {
      sub: user.googleId,
      email: user.email,
      role: user.role,
    }

    const jwtAccessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    })

    const jwtRefreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    })

    done(null, { user, jwtAccessToken, jwtRefreshToken, isFirstLogin })
  }
}
