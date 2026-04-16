import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin || session.user.departmentId !== null) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      fullName: true,
      email: true,
      mobile: true,
      isAdmin: true,
      departmentId: true,
      createdAt: true,
      department: { select: { name: true } },
      _count: { select: { complaints: true } },
    },
  })

  return NextResponse.json(users)
}
