import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      fullName: string
      departmentId: number | null
    } & DefaultSession['user']
  }

  interface User {
    isAdmin: boolean
    fullName: string
    departmentId: number | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isAdmin: boolean
    fullName: string
    departmentId: number | null
  }
}
