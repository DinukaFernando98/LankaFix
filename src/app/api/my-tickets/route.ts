import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const complaints = await prisma.complaint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      referenceNumber: true,
      title: true,
      status: true,
      priority: true,
      address: true,
      district: true,
      createdAt: true,
      updatedAt: true,
      photoUrl: true,
      category: { select: { name: true } },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
        take: 1,
        select: { notes: true, changedAt: true },
      },
    },
  })

  return NextResponse.json(complaints)
}
