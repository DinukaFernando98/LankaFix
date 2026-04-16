import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })
          if (!user) return null
          const valid = await bcrypt.compare(credentials.password as string, user.password)
          if (!valid) return null
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            isAdmin: user.isAdmin,
            fullName: user.fullName,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.isAdmin = (user as { isAdmin: boolean }).isAdmin
        token.fullName = (user as { fullName: string }).fullName
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.isAdmin = token.isAdmin as boolean
      session.user.fullName = token.fullName as string
      return session
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})
