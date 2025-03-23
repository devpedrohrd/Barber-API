import { Test, TestingModule } from '@nestjs/testing'
import { UserService } from './user.service'
import { users, userReq } from 'src/utils/mocks/user'
import { AppointmentService } from 'src/appointment/appointment.service'
import { SearchUserFilter } from './dto/filterUserDTO'
import { Roles } from 'src/auth/dto/roles'

describe('UserService', () => {
  let serviceUser: UserService
  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  }
  const mockAppointmentModel = {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteMany: jest.fn(),
  }

  const mockBarberScheduleModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        AppointmentService,
        {
          provide: 'UserModel',
          useValue: mockUserModel,
        },
        {
          provide: 'AppointmentModel',
          useValue: mockAppointmentModel,
        },
        {
          provide: 'BarberScheduleModel',
          useValue: mockBarberScheduleModel,
        },
      ],
    }).compile()

    serviceUser = module.get<UserService>(UserService)
  })

  it('should be defined', () => {
    expect(serviceUser).toBeDefined()
  })

  it('should find all users', async () => {
    mockUserModel.find.mockResolvedValue(users)
    const result = await serviceUser.findAll()

    expect(result).toEqual(users)
    expect(mockUserModel.find).toHaveBeenCalled()
    expect(mockUserModel.find).toHaveBeenCalledTimes(1)
  })

  it('should find a user by ID', async () => {
    const mockUser = users[0]

    mockUserModel.findById.mockResolvedValue(mockUser)
    const result = await serviceUser.findOne(mockUser._id.$oid)

    expect(result).toEqual(mockUser)
    expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id.$oid)

    expect(mockUserModel.findById).toHaveBeenCalledTimes(1)
  })

  it('should update a user', async () => {
    const mockUser = users[0]
    const updateData = {
      id: mockUser._id.$oid,
      displayName: 'John Doe Updated',
      email: '',
      isActive: false,
      phone: '',
      description: '',
      avatarUrl: '',
      isFirstLogin: true,
    }

    mockUserModel.findById.mockResolvedValue(mockUser)
    mockUserModel.findByIdAndUpdate.mockResolvedValue({
      ...mockUser,
      ...updateData,
    })

    const result = await serviceUser.update(
      mockUser._id.$oid,
      updateData,
      userReq,
    )

    expect(result).toEqual({ ...mockUser, ...updateData })
    expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id.$oid)
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: expect.any(Object) }),
      { $set: updateData },
      { new: true },
    )
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledTimes(1)
  })

  it('should remove a user', async () => {
    const mockUser = users[0]
    mockAppointmentModel.deleteMany.mockResolvedValue({ deletedCount: 1 })
    mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser)

    const result = await serviceUser.remove(mockUser._id.$oid)

    expect(result).toEqual(mockUser)
    expect(mockAppointmentModel.deleteMany).toHaveBeenCalledWith({
      $or: [{ barberId: mockUser._id.$oid }, { clientId: mockUser._id.$oid }],
    })
    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(
      mockUser._id.$oid,
    )
    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
    expect(mockAppointmentModel.deleteMany).toHaveBeenCalledTimes(1)
    expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledTimes(1)
  })

  it('should search users with role client', async () => {
    const filter: SearchUserFilter = {
      displayName: '',
      email: '',
      role: Roles.CLIENT,
    }

    const mockUsers = users.filter((user) => user.role.includes(filter.role))

    mockUserModel.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockUsers),
    })

    mockUserModel.countDocuments.mockResolvedValue(mockUsers.length)

    const result = await serviceUser.searchUser(filter)

    expect(result).toEqual({ users: mockUsers, total: mockUsers.length })
  })
})
