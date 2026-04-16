import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const session = req.auth
  const { pathname } = req.nextUrl

  if ((pathname.startsWith('/submit') || pathname.startsWith('/my-tickets')) && !session) {
    return NextResponse.redirect(
      new URL(`/auth?callbackUrl=${encodeURIComponent(pathname)}`, req.nextUrl)
    )
  }

  if (pathname.startsWith('/admin')) {
    // Unauthenticated users are allowed through — admin layout shows the login form
    if (session && !session.user.isAdmin) {
      return NextResponse.redirect(new URL('/', req.nextUrl))
    }
  }
})

export const config = {
  matcher: ['/submit/:path*', '/admin/:path*', '/my-tickets/:path*', '/my-tickets'],
}
