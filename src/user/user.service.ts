import { SearchUserFilter } from './dto/filterUserDTO'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, mongo } from 'mongoose'
import { Appointment } from 'src/appointment/entities/appointment.entity'
import { Roles } from 'src/auth/dto/roles'
import { getFiltersMapped } from 'src/utils/filters'

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
  ) { }

  async findOnCreate(user: Partial<User>) {
    const userExists = await this.userModel.findOne({ googleId: user.googleId })

    if (userExists) {
      return userExists
    }

    const newUser = new this.userModel({ ...user, isFirstLogin: true })

    return newUser.save()
  }

  async findAll() {
    const users = await this.userModel.find()

    return users ? users : []
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id)

    return user ? user : {}
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: any) {
    if (user.role !== Roles.CLIENT && user.id !== id) {
      throw new BadRequestException('UNAUTHORIZED')
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: new mongo.ObjectId(id) },
      { $set: { ...updateUserDto, isFirstLogin: true } },
      { new: true },
    )

    return updatedUser
  }

  async remove(id: string) {
    await this.appointmentModel.deleteMany({
      $or: [{ barberId: id }, { clientId: id }],
    })

    const deletedUser = await this.userModel.findByIdAndDelete(id)

    return deletedUser
  }

  async searchUser(filter: SearchUserFilter) {
    const { displayName, email, id, isActive, phone, role } = filter

    const where: FilterQuery<User> = {
      ...(displayName || email || phone || id || isActive || role
        ? {
          ...(displayName && {
            displayName: { $regex: new RegExp(displayName, 'i') },
          }),
          ...(email && { email: { $regex: new RegExp(email, 'i') } }),
          ...(phone && { phone: { $regex: new RegExp(phone, 'i') } }),
          ...(id && { _id: id }),
          ...(isActive && { isActive }),
          ...(role && { role }),
        }
        : {}),
    }

    const filterMapped = getFiltersMapped(where)

    const users = await this.userModel
      .find(where).lean()
      .sort({ createdAt: -1 })
      .skip(filterMapped.page * filterMapped.limit)
      .limit(filterMapped.limit)
      .exec()

    const total = await this.userModel.countDocuments(where)

    return users ? { users, total } : { users: [], total: 0 }
  }

  async markFirstLoginCompleted(googleId: string) {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { googleId },
      { $set: { isFirstLogin: false } },
      { new: true },
    )

    console.log(updatedUser)

    return updatedUser
  }
}
