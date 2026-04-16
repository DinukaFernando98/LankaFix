import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [total, open, inProgress, resolved, urgent, thisMonth] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: 'Open' } }),
    prisma.complaint.count({ where: { status: 'InProgress' } }),
    prisma.complaint.count({ where: { status: 'Resolved' } }),
    prisma.complaint.count({ where: { status: 'Urgent' } }),
    prisma.complaint.count({ where: { createdAt: { gte: monthStart } } }),
  ])

  return NextResponse.json({ total, open, inProgress, resolved, urgent, thisMonth })
}
