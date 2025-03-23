import { Test, TestingModule } from '@nestjs/testing'
import { GoogleStrategy } from './strategies/google.strategy'
import { UserService } from 'src/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { Roles } from './dto/roles'

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy
  let userService: UserService
  let jwtService: JwtService

  beforeAll(() => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/auth/google/callback'
  })

  const mockUserService = {
    findOnCreate: jest.fn(),
    markFirstLoginCompleted: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked-token'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy)
    userService = module.get<UserService>(UserService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(googleStrategy).toBeDefined()
  })

  it('should authenticate an existing user and return tokens', async () => {
    const mockProfile = {
      id: 'google-id-123',
      displayName: 'John Doe',
      emails: [{ value: 'john.doe@example.com' }],
      photos: [{ value: 'http://example.com/avatar.jpg' }],
    }

    const mockUser = {
      _id: 'user-id-123',
      googleId: 'google-id-123',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
      role: Roles.CLIENT,
      isFirstLogin: false,
    }

    mockUserService.findOnCreate.mockResolvedValue(mockUser)

    const done = jest.fn()
    await googleStrategy.validate(
      'access-token',
      'refresh-token',
      mockProfile,
      done,
    )

    expect(mockUserService.findOnCreate).toHaveBeenCalledWith({
      googleId: 'google-id-123',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      avatarUrl: 'http://example.com/avatar.jpg',
      role: Roles.CLIENT,
      phone: '',
      description: '',
    })

    expect(jwtService.sign).toHaveBeenCalledTimes(2)
    expect(done).toHaveBeenCalledWith(null, {
      user: mockUser,
      jwtAccessToken: 'mocked-token',
      jwtRefreshToken: 'mocked-token',
      isFirstLogin: false,
    })
  })

  it('should create a new user if not found and return tokens', async () => {
    const mockProfile = {
      id: 'google-id-123',
      displayName: 'Jane Doe',
      emails: [{ value: 'jane.doe@example.com' }],
      photos: [{ value: 'http://example.com/avatar2.jpg' }],
    }

    const mockNewUser = {
      _id: 'new-user-id-456',
      googleId: 'google-id-123',
      email: 'jane.doe@example.com',
      displayName: 'Jane Doe',
      avatarUrl: 'http://example.com/avatar2.jpg',
      role: Roles.CLIENT,
      isFirstLogin: true,
    }

    const mockUpdatedUser = { ...mockNewUser, isFirstLogin: false }

    mockUserService.findOnCreate.mockResolvedValue(mockNewUser)
    mockUserService.markFirstLoginCompleted.mockResolvedValue(mockUpdatedUser)

    const done = jest.fn()
    await googleStrategy.validate(
      'access-token',
      'refresh-token',
      mockProfile,
      done,
    )

    expect(mockUserService.findOnCreate).toHaveBeenCalledWith({
      googleId: 'google-id-123',
      email: 'jane.doe@example.com',
      displayName: 'Jane Doe',
      avatarUrl: 'http://example.com/avatar2.jpg',
      role: Roles.CLIENT,
      phone: '',
      description: '',
    })

    expect(mockUserService.markFirstLoginCompleted).toHaveBeenCalledWith(
      'google-id-123',
    )

    expect(jwtService.sign).toHaveBeenCalledTimes(4)
    expect(done).toHaveBeenCalledWith(null, {
      user: mockUpdatedUser,
      jwtAccessToken: 'mocked-token',
      jwtRefreshToken: 'mocked-token',
      isFirstLogin: false,
    })
  })
})
