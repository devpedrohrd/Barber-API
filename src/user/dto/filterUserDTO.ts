import { UserDocument } from '../entities/user.entity'

export type SearchUserFilter = Pick<
  UserDocument,
  'id' | 'email' | 'displayName' | 'isActive' | 'phone' | 'role'
>
