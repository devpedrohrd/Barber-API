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
  ) { }

  private async checkBarber(barberId: string) {
    const barber = await this.userModel.findOne({ _id: barberId }).lean().exec()

    if (
      !barber &&
      barber.role !== Roles.BARBER &&
      barber.role !== Roles.ADMIN
    ) {
      throw new BadRequestException('BARBER_NOT_FOUND')
    }

    return barber
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

    return client
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const session = await this.appointmentModel.db.startSession()
    session.startTransaction()

    try {
      await this.checkBarber(createAppointmentDto.barberId)
      await this.checkCostumer(createAppointmentDto.costumer)

      const existingAppointment = await this.appointmentModel
        .findOne({
          date: createAppointmentDto.date,
          barberId: createAppointmentDto.barberId,
        })
        .session(session)
        .lean()
        .exec()

      if (existingAppointment) {
        throw new ConflictException('APPOINTMENT_ALREADY_BOOKED')
      }

      const newAppointment = new this.appointmentModel(createAppointmentDto)
      await newAppointment.save({ session })

      await session.commitTransaction()
      return newAppointment
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async findAll() {
    const appointments = await this.appointmentModel.find().exec()

    const count = await this.appointmentModel.countDocuments().exec()

    return appointments && count ? { appointments, count } : []
  }

  async findOne(id: string) {
    const appointment = await this.appointmentModel.findById({ _id: id }).exec()

    return appointment ? appointment : {}
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: any,
  ) {
    const session = await this.appointmentModel.db.startSession()
    session.startTransaction()
    try {
      await this.checkBarber(updateAppointmentDto.barberId)
      await this.checkCostumer(updateAppointmentDto.costumer)

      const appointment = await this.appointmentModel
        .findById(id)
        .session(session)
        .exec()

      if (!appointment) {
        throw new BadRequestException('APPOINTMENT_NOT_FOUND')
      }

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
        .session(session)
        .exec()

      await session.commitTransaction()
      return updatedAppointment
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async remove(id: string, user: any) {
    const appointment = await this.appointmentModel.findById(id).lean().exec()

    if (!appointment) {
      throw new BadRequestException('APPOINTMENT_NOT_FOUND')
    }

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

    let appointmentsQuery = await this.appointmentModel
      .find(where)
      .sort({
        [filterMapped.sortBy]: filterMapped.order,
      })
      .skip(filterMapped.page * filterMapped.limit)
      .limit(filterMapped.limit)
      .lean()
      .exec()

    return { count, appointmentsQuery }
  }

  async crateBarberSchedule(barberId: string, availability: BarberScheduleDTO) {
    await this.checkBarber(barberId)

    const existingSchedule = await this.scheduleModel
      .findOne({ barber: barberId })
      .exec()

    if (existingSchedule) {
      throw new ConflictException('BARBER_SCHEDULE_ALREADY_EXISTS')
    }

    const newSchedule = new this.scheduleModel({
      barber: barberId,
      availability: availability.availability,
    })

    return await newSchedule.save()
  }

  async getScheduleBarber(barberId: string, user: any) {
    const barber = await this.checkBarber(barberId)

    if (user.role !== Roles.ADMIN && barber.id !== barberId) {
      throw new BadRequestException('UNAUTHORIZED')
    }

    const schedule = await this.scheduleModel
      .findOne({ barber: barberId })
      .lean()
      .exec()

    if (!schedule) {
      throw new BadRequestException('BARBER_SCHEDULE_NOT_FOUND')
    }

    return schedule
  }

  async updateBarberSchedule(
    availability: BarberScheduleDTO,
    barberId: string,
    user: any,
  ) {
    const barber = await this.checkBarber(barberId)

    if (user.role !== Roles.ADMIN && barber.id !== barberId) {
      throw new BadRequestException('UNAUTHORIZED')
    }

    const updatedSchedule = await this.scheduleModel
      .findOneAndUpdate(
        { barber: barberId },
        { $set: availability },
        { new: true },
      )
      .exec()

    return updatedSchedule
  }

  async deleteBarberSchedule(barberId: string, user: any) {
    const barber = await this.checkBarber(barberId)

    if (user.role !== Roles.ADMIN && barber.id !== barberId) {
      throw new BadRequestException('UNAUTHORIZED')
    }

    const schedule = await this.scheduleModel
      .findOne({ barber: barberId })
      .exec()

    if (!schedule) {
      throw new BadRequestException('BARBER_SCHEDULE_NOT_FOUND')
    }

    return await this.scheduleModel.deleteOne({ barber: barberId }).exec()
  }
}
