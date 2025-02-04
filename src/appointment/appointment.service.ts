import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Roles } from 'src/auth/dto/roles'
import { getFiltersMapped } from 'src/utils/filters'

import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { SearchAppointmentFilter } from './dto/filterAppointment'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { Appointment } from './entities/appointment.entity'

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment') private appointmentModel: Model<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const existingAppointment = await this.appointmentModel
      .findOne({
        date: createAppointmentDto.date,
        barberId: createAppointmentDto.barberId,
      })
      .lean()
      .exec()

    if (existingAppointment) {
      throw new ConflictException('APPOINTMENT_ALREADY_BOOKED')
    }

    return new this.appointmentModel(createAppointmentDto).save()
  }

  async findAll() {
    const appointments = this.appointmentModel.find().exec()

    return appointments ? appointments : []
  }

  async findOne(id: string) {
    const appointment = this.appointmentModel.findById({ _id: id }).exec()

    return appointment ? appointment : {}
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: any,
  ) {
    const appointment = await this.appointmentModel.findById(id).exec()

    if (user.role !== Roles.ADMIN) {
      if (
        user.role === Roles.BARBER &&
        appointment.barberId &&
        appointment.barberId !== user.id
      ) {
        throw new BadRequestException(
          'YOU_ARE_NOT_THE_BARBER_OF_THIS_APPOINTMENT',
        )
      }

      if (
        user.role === Roles.CLIENT &&
        appointment.costumer &&
        appointment.costumer !== user.id
      ) {
        throw new BadRequestException(
          'YOU_ARE_NOT_THE_CLIENT_OF_THIS_APPOINTMENT',
        )
      }
    }
    const updatedAppointment = await this.appointmentModel
      .findOneAndUpdate(
        { _id: id },
        { $set: updateAppointmentDto },
        { new: true },
      )
      .exec()

    return updatedAppointment
  }

  async remove(id: string, user: any) {
    const appointment = this.appointmentModel.findById(id).exec()

    if (!appointment) {
      throw new BadRequestException('APPOINTMENT_NOT_FOUND')
    }

    if (user.role !== Roles.ADMIN) {
      if (
        user.role === Roles.BARBER &&
        (await appointment).barberId &&
        (await appointment).barberId !== user.id
      ) {
        throw new BadRequestException(
          'YOU_ARE_NOT_THE_BARBER_OF_THIS_APPOINTMENT',
        )
      }

      if (
        user.role === Roles.CLIENT &&
        (await appointment).costumer &&
        (await appointment).costumer !== user.id
      ) {
        throw new BadRequestException(
          'YOU_ARE_NOT_THE_CLIENT_OF_THIS_APPOINTMENT',
        )
      }
    }

    return await this.appointmentModel.deleteOne({ _id: id }).exec()
  }

  async searchAppointment(filter: SearchAppointmentFilter, user: any) {
    const { date, costumer, barberId, status, service, isPaid, id } = filter

    // Restrições para que barbeiros e clientes só possam acessar seus próprios agendamentos
    if (user.role === Roles.BARBER) {
      filter.barberId = user.id
    } else if (user.role === Roles.CLIENT) {
      filter.costumer = user.id
    }

    const where = {
      ...(date || costumer || barberId || status || service || isPaid || id
        ? {
            ...(date && {
              date: {
                $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
              },
            }),
            ...(costumer && { costumer }),
            ...(barberId && { barberId }),
            ...(status && { status }),
            ...(service && { service }),
            ...(isPaid !== undefined && { isPaid }),
            ...(id && { _id: id }),
          }
        : {}),
    }

    const filterMapped = getFiltersMapped(where)

    const count = await this.appointmentModel.countDocuments(where)

    let appointmentsQuery = this.appointmentModel.find(where)

    if (filterMapped.sortBy) {
      const order = filterMapped.order === 'desc' ? -1 : 1
      appointmentsQuery = appointmentsQuery.sort({
        [filterMapped.sortBy]: order,
      })
    }

    appointmentsQuery = appointmentsQuery
      .skip(filterMapped.page * filterMapped.limit)
      .limit(filterMapped.limit)

    const appointments = await appointmentsQuery.exec()

    return { count, appointments }
  }
}
