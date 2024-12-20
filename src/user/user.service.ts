import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/Config/DB/Prisma.service'
import { User } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async checkUserExist(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    if (user) {
      throw new ConflictException('USER_ALREADY_EXISTS')
    }

    return user
  }

  async create(
    createUserDto: Omit<CreateUserDto, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User> {
    try {
      await this.checkUserExist(createUserDto.email)

      const user = await this.prismaService.user.create({
        data: createUserDto,
      })

      return user
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prismaService.user.findMany()
      return users ? users : []
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      })

      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND')
      }

      return user
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = this.prismaService.user.findFirst({
        where: {
          id,
        },
      })

      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND')
      }

      return this.prismaService.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      })
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }

  async remove(id: number) {
    try {
      const user = this.prismaService.user.findFirst({
        where: {
          id,
        },
      })

      if (!user) {
        throw new NotFoundException('USER_NOT_FOUND')
      }

      return this.prismaService.user.delete({
        where: {
          id,
        },
      })
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }

  async findUserByGoogleId(googleId: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          googleId,
        },
      })

      if (user) {
        throw new ConflictException('USER_ALREADY_EXISTS')
      }

      return user
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }
}
