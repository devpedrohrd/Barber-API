import { CreateBarberDto } from './dto/create-barber.dto'
import { UpdateBarberDto } from './dto/update-barber.dto'
import { Barber } from './entities/barber.entity'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as bcrypt from 'bcrypt'
import { Model, mongo } from 'mongoose'

@Injectable()
export class BarberService {
  constructor(@InjectModel(Barber.name) private barberModel: Model<Barber>) {}

  async create(createBarberDto: CreateBarberDto) {
    try {
      const uaserExists = await this.barberModel.findOne({
        email: createBarberDto.email,
      })

      if (uaserExists) {
        throw new ConflictException('USER_ALREADY_EXISTS')
      }

      const barber = new this.barberModel({
        ...createBarberDto,
        password: await bcrypt.hash(createBarberDto.password, 10),
      }).save()

      return barber
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findAll() {
    try {
      const barbers = await this.barberModel.find()

      return barbers ? barbers : []
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findOne(id: string) {
    try {
      const barber = await this.barberModel.findById(new mongo.ObjectId(id))

      return barber ? barber : {}
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async update(id: string, updateBarberDto: UpdateBarberDto) {
    try {
      if (updateBarberDto.password) {
        updateBarberDto.password = await bcrypt.hash(
          updateBarberDto.password,
          10,
        )
      }

      const barber = await this.barberModel.findByIdAndUpdate(
        new mongo.ObjectId(id),
        updateBarberDto,
      )

      if (!barber) {
        throw new BadRequestException('BARBER_NOT_FOUND')
      }

      return barber
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async remove(id: string) {
    try {
      const barber = await this.barberModel.findByIdAndDelete(
        new mongo.ObjectId(id),
      )

      if (!barber) {
        throw new NotFoundException('BARBER_NOT_FOUND')
      }

      return barber
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findBarberByEmail(email: string) {
    try {
      const barber = await this.barberModel.findOne({ email })

      return barber ? barber : null
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async validateBarber(email: string, password: string) {
    try {
      const barber = await this.findBarberByEmail(email)

      if (barber && (await bcrypt.compare(password, barber.password))) {
        return barber
      }

      throw new BadRequestException('INVALID_CREDENTIALS')
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }
}
