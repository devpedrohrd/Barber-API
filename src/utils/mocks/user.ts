export const users = [
  {
    _id: {
      $oid: '67a0fb6682d15f446c9af59d',
    },
    googleId: '117413523911718553103',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    avatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJKnp03xaBA-xp5A2k4vyAc7qZVRkLrhIAMMkPv2rRqdtMBmB=s96-c',
    phone: '123-456-7890',
    role: 'client',
    description: 'Regular customer',
    isFirstLogin: true,
    createdAt: {
      $date: '2025-03-01T12:00:00.000Z',
    },
    updatedAt: {
      $date: '2025-03-01T12:00:00.000Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '67a0fb6682d15f446c9af59e',
    },
    googleId: '117413523911718553104',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    avatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJKnp03xaBA-xp5A2k4vyAc7qZVRkLrhIAMMkPv2rRqdtMBmC=s96-c',
    phone: '987-654-3210',
    role: 'barber',
    description: 'Experienced barber',
    isFirstLogin: false,
    createdAt: {
      $date: '2025-04-15T08:30:00.000Z',
    },
    updatedAt: {
      $date: '2025-04-15T08:30:00.000Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '67a0fb6682d15f446c9af59f',
    },
    googleId: '117413523911718553105',
    email: 'alice.jones@example.com',
    displayName: 'Alice Jones',
    avatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJKnp03xaBA-xp5A2k4vyAc7qZVRkLrhIAMMkPv2rRqdtMBmD=s96-c',
    phone: '555-123-4567',
    role: 'client',
    description: 'New customer',
    isFirstLogin: true,
    createdAt: {
      $date: '2025-05-20T14:45:00.000Z',
    },
    updatedAt: {
      $date: '2025-05-20T14:45:00.000Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '67a0fb6682d15f446c9af5a0',
    },
    googleId: '117413523911718553106',
    email: 'bob.brown@example.com',
    displayName: 'Bob Brown',
    avatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJKnp03xaBA-xp5A2k4vyAc7qZVRkLrhIAMMkPv2rRqdtMBmE=s96-c',
    phone: '444-555-6666',
    role: 'barber',
    description: 'Expert in modern styles',
    isFirstLogin: false,
    createdAt: {
      $date: '2025-06-10T09:15:00.000Z',
    },
    updatedAt: {
      $date: '2025-06-10T09:15:00.000Z',
    },
    __v: 0,
  },
  {
    _id: {
      $oid: '67a0fb6682d15f446c9af5a0',
    },
    googleId: '117413523911718553106',
    email: 'bob.brown2@example.com',
    displayName: 'Bob Brown',
    avatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocJKnp03xaBA-xp5A2k4vyAc7qZVRkLrhIAMMkPv2rRqdtMBmE=s96-c',
    phone: '444-555-6666',
    role: 'admin',
    description: 'Expert in modern styles',
    isFirstLogin: false,
    createdAt: {
      $date: '2025-06-10T09:15:00.000Z',
    },
    updatedAt: {
      $date: '2025-06-10T09:15:00.000Z',
    },
    __v: 0,
  },
]

export const userReq = {
  id: '67a0fb6682d15f446c9af59d',
  email: 'john.doe@example.com',
  role: 'client',
}
