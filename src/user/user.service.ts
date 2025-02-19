import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { SearchUserFilter } from './dto/filterUserDTO'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, mongo } from 'mongoose'
import { Appointment } from 'src/appointment/entities/appointment.entity'
import { Roles } from 'src/auth/dto/roles'
import { getFiltersMapped } from 'src/utils/filters'
import { RedisCacheService } from 'src/utils/cacheConnection'

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    private readonly cacheManager: RedisCacheService,
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
    try {
      const usersCached = await this.cacheManager.get('users')

      if (usersCached) {
        console.log(`Pegando do cache`)

        return usersCached
      }

      const users = await this.userModel.find()

      await this.cacheManager.set('users', users, 60)

      return users ? users : []
    } catch (error) {
      console.error(error)
    } finally {
      await this.cacheManager.onModuleDestroy()
    }
  }

  async findOne(id: string) {
    try {
      const userCached = await this.cacheManager.get(`user:${id}`)
      if (userCached) {
        console.log(`Pegando do cache`)

        return userCached
      }
      const user = await this.userModel.findById(id)

      await this.cacheManager.set(`user:${id}`, user, 60)

      return user ? user : {}
    } catch (error) {
      console.error(error)
    } finally {
      await this.cacheManager.onModuleDestroy()
    }
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

    let usersQuery = this.userModel.find(where)

    if (filterMapped.sortBy) {
      const order = filterMapped.order === 'desc' ? -1 : 1
      usersQuery = usersQuery.sort({ [filterMapped.sortBy]: order })
    }

    // Aplicando paginação
    usersQuery = usersQuery
      .skip(filterMapped.page * filterMapped.limit)
      .limit(filterMapped.limit)

    const count = await this.userModel.countDocuments(where)

    const users = await usersQuery
    return users ? { count, users } : { count: 0, users: [] }
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
