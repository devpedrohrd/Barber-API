import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Roles } from 'src/auth/dto/roles'
import { User } from 'src/user/entities/user.entity'
import { getFiltersMapped } from 'src/utils/filters'

import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { SearchAppointmentFilter } from './dto/filterAppointment'
import { UpdateAppointmentDto } from './dto/update-appointment.dto'
import { Appointment } from './entities/appointment.entity'
import { BarberSchedule, BarberScheduleDTO } from './entities/schedule.entity'

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment') private appointmentModel: Model<Appointment>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('BarberSchedule') private scheduleModel: Model<BarberSchedule>,
  ) {}

  private async checkBarber(barberId: string) {
    const barber = await this.userModel.findOne({ _id: barberId }).lean().exec()

    if (
      !barber &&
      barber.role !== Roles.BARBER &&
      barber.role !== Roles.ADMIN
    ) {
      throw new BadRequestException('BARBER_NOT_FOUND')
    }
  }

  private async checkCostumer(costumerId: string) {
    const client = await this.userModel
      .findOne({ _id: costumerId })
      .lean()
      .exec()

    if (
      !client &&
      client.role !== Roles.CLIENT &&
      client.role !== Roles.ADMIN
    ) {
      throw new BadRequestException('CLIENT_NOT_FOUND')
    }
  }

  private async checkBarberAvailability(barberId: string, date: Date) {
    // Buscar o horário cadastrado do barbeiro
    const barberSchedule = await this.scheduleModel
      .findOne({ barber: barberId })
      .lean()
      .exec()

    if (!barberSchedule) {
      throw new BadRequestException('BARBER_SCHEDULE_NOT_FOUND')
    }

    const dayOfWeek = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
    }).format(date)

    const availableSlot = barberSchedule.availability.find(
      (slot) => slot.day === dayOfWeek,
    )

    if (!availableSlot) {
      throw new BadRequestException('BARBER_NOT_AVAILABLE_THIS_DAY')
    }

    const appointmentTime = date.toISOString().split('T')[1].slice(0, 5) // Obtém a hora no formato "HH:MM"

    if (
      !(
        appointmentTime >= availableSlot.startTime &&
        appointmentTime < availableSlot.endTime
      )
    ) {
      throw new BadRequestException('BARBER_NOT_AVAILABLE_THIS_TIME')
    }
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    await this.checkBarber(createAppointmentDto.barberId)

    await this.checkCostumer(createAppointmentDto.costumer)

    await this.checkBarberAvailability(
      createAppointmentDto.barberId,
      createAppointmentDto.date,
    )

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

    return await new this.appointmentModel(createAppointmentDto).save()
  }

  async findAll() {
    const appointments = this.appointmentModel.find().exec()

    const count = this.appointmentModel.countDocuments().exec()

    return appointments && count ? { appointments, count } : []
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
    await this.checkBarber(updateAppointmentDto.barberId)

    await this.checkCostumer(updateAppointmentDto.costumer)

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
    if (user.role !== Roles.ADMIN) {
      if (user.role === Roles.BARBER) {
        filter.barberId = user.id
      } else if (user.role === Roles.CLIENT) {
        filter.costumer = user.id
      }
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

  async crateBarberSchedule(barberId: string, availability: any) {
    await this.checkBarber(barberId)

    const existingSchedule = await this.scheduleModel
      .findOne({ barber: barberId })
      .lean()
      .exec()

    if (existingSchedule) {
      throw new ConflictException('BARBER_SCHEDULE_ALREADY_EXISTS')
    }

    return await new this.scheduleModel({
      barber: barberId,
      availability,
    }).save()
  }

  async updateBarberSchedule(availability: BarberScheduleDTO, request: any) {
    await this.checkBarber(request.user.id)

    const updatedSchedule = await this.scheduleModel
      .findOneAndUpdate(
        { barber: request.user.id },
        { $set: availability },
        { new: true },
      )
      .exec()

    return updatedSchedule
  }
}
