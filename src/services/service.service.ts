import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { CreateServiceDto } from './dto/create-service.dto'
import { UpdateServiceDto } from './dto/update-service.dto'
import { PrismaService } from 'src/Config/DB/Prisma.service'
import { Service } from '@prisma/client'

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const serviceWithSameClient = await this.prismaService.service.findFirst({
        where: {
          name: createServiceDto.name,
        },
      })

      if (serviceWithSameClient) {
        throw new Error(
          `SERVICE WITH NAME ${createServiceDto.name} ALREADY EXISTS`,
        )
      }

      return this.prismaService.service.create({
        data: createServiceDto,
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      const services = await this.prismaService.service.findMany()

      return services ? services : []
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findOne(id: number): Promise<Service | {}> {
    try {
      const service = await this.prismaService.service.findUnique({
        where: {
          id,
        },
      })

      return service ? service : {}
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service | {}> {
    try {
      const service = await this.prismaService.service.findUnique({
        where: {
          id,
        },
      })

      if (!service) {
        throw new NotFoundException(`SERVICE WITH ID ${id} NOT FOUND`)
      }

      return this.prismaService.service.update({
        where: {
          id,
        },
        data: updateServiceDto,
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async remove(id: number): Promise<Boolean> {
    try {
      const service = await this.prismaService.service.findUnique({
        where: {
          id,
        },
      })

      if (!service) {
        throw new NotFoundException(`SERVICE WITH ID ${id} NOT FOUND`)
      }

      await this.prismaService.service.delete({
        where: {
          id,
        },
      })

      return true
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}
