import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, mongo } from 'mongoose'
import { getFiltersMapped } from 'src/utils/filters'

import { SearchUserFilter } from './dto/filterUserDTO'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { Roles } from 'src/auth/dto/roles'

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async findOnCreate(user: Partial<User>) {
    const userExists = await this.userModel.findOne({ googleId: user.googleId })

    if (userExists) {
      throw new ConflictException('USER_ALREADY_EXISTS')
    }

    const newUser = new this.userModel(user).save()

    return newUser
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
      { $set: updateUserDto },
      { new: true },
    )

    return updatedUser
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id)

    return deletedUser
  }

  async searchUser(filter: SearchUserFilter) {
    const { displayName, email, id, isActive, phone } = filter

    const where: FilterQuery<User> = {
      ...(displayName || email || phone || id || isActive
        ? {
            ...(displayName && {
              displayName: { $regex: new RegExp(displayName, 'i') },
            }),
            ...(email && { email: { $regex: new RegExp(email, 'i') } }),
            ...(phone && { phone: { $regex: new RegExp(phone, 'i') } }),
            ...(id && { _id: id }),
          }
        : {}),
    }

    const filterMapped = getFiltersMapped(where)

    let usersQuery = this.userModel.find(where)

    if (filterMapped.sortBy) {
      const order = filterMapped.order === 'desc' ? -1 : 1
      usersQuery = usersQuery.sort({ [filterMapped.sortBy]: order })
    }

    // Aplicando paginação
    usersQuery = usersQuery
      .skip(filterMapped.page * filterMapped.limit)
      .limit(filterMapped.limit)

    const users = await usersQuery
    return users ?? []
  }
}
