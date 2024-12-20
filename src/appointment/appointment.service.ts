import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { PrismaService } from 'src/Config/DB/Prisma.service'
import { Appointment } from '@prisma/client'

@Injectable()
export class AppointmentService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<CreateAppointmentDto> {
    try {
      const appointmentClientExists =
        await this.prismaService.appointment.findMany({
          where: {
            userClientId: createAppointmentDto.userClientId,
            date: createAppointmentDto.date,
            userBarberId: createAppointmentDto.userBarberId,
          },
        })

      if (appointmentClientExists.length) {
        throw new ConflictException('THIS_APPOINTMENT_ALREADY_EXISTS')
      }
      return await this.prismaService.appointment.create({
        data: createAppointmentDto,
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findAll(): Promise<Appointment[]> {
    try {
      const appointments = await this.prismaService.appointment.findMany()

      return appointments ? appointments : []
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findOne(id: number): Promise<Appointment | {}> {
    try {
      const appointment = await this.prismaService.appointment.findUnique({
        where: {
          id,
        },
      })

      return appointment ? appointment : {}
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    try {
      const appointment = await this.prismaService.appointment.findMany({
        where: {
          userBarberId: updateAppointmentDto.userBarberId,
          userClientId: updateAppointmentDto.userClientId,
          date: updateAppointmentDto.date,
        },
      })

      if (appointment.length) {
        throw new ConflictException('THIS_APPOINTMENT_ALREADY_EXISTS')
      }

      return await this.prismaService.appointment.update({
        where: {
          id,
        },
        data: updateAppointmentDto,
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async remove(id: number) {
    try {
      return await this.prismaService.appointment.delete({
        where: {
          id,
        },
      })
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}
