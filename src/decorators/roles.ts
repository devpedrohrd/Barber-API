import { SetMetadata } from '@nestjs/common'
import { Roles } from 'src/auth/dto/roles'

export const Role = (...args: Roles[]) => SetMetadata('role', args)
