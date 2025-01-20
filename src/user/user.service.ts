import { ConflictException, Injectable } from '@nestjs/common'
import { UpdateUserDto } from './dto/update-user.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User } from './entities/user.entity'

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

  async findOne(id: number) {
    const user = await this.userModel.findById(id)

    return user ? user : {}
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userModel.findByIdAndUpdate({
      _id: id,
      $set: updateUserDto,
    })

    return updatedUser
  }

  async remove(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id)

    return deletedUser
  }
}
