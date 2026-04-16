import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const deptId = session.user.departmentId
  const deptFilter = deptId ? { category: { departmentId: deptId } } : {}

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [total, open, inProgress, resolved, urgent, thisMonth] = await Promise.all([
    prisma.complaint.count({ where: { ...deptFilter } }),
    prisma.complaint.count({ where: { ...deptFilter, status: 'Open' } }),
    prisma.complaint.count({ where: { ...deptFilter, status: 'InProgress' } }),
    prisma.complaint.count({ where: { ...deptFilter, status: 'Resolved' } }),
    prisma.complaint.count({ where: { ...deptFilter, status: 'Urgent' } }),
    prisma.complaint.count({ where: { ...deptFilter, createdAt: { gte: monthStart } } }),
  ])

  return NextResponse.json({ total, open, inProgress, resolved, urgent, thisMonth })
}
