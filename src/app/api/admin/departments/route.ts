import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { categories: true, admins: true } },
    },
  })

  return NextResponse.json(departments)
}
