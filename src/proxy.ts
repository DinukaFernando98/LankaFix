import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/submit') && !session) {
    return NextResponse.redirect(new URL('/auth', req.nextUrl))
  }

  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.nextUrl))
    }
    if (!session.user.isAdmin) {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }
  }
})

export const config = {
  matcher: ['/submit/:path*', '/admin/:path*'],
}
