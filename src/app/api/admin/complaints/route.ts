import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { Status } from '@/types'

const VALID_STATUSES: Status[] = ['Open', 'InProgress', 'Resolved', 'Urgent']
const LIMIT = 20

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const statusParam = searchParams.get('status')
  const district = searchParams.get('district') || undefined
  const categoryId = searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  const search = searchParams.get('search') || undefined
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const format = searchParams.get('format')

  const status =
    statusParam && (VALID_STATUSES as string[]).includes(statusParam)
      ? (statusParam as Status)
      : undefined

  const where = {
    ...(status && { status }),
    ...(district && { district }),
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { referenceNumber: { contains: search.toUpperCase() } },
        { title: { contains: search } },
      ],
    }),
  }

  const include = {
    category: {
      include: { department: { select: { name: true } } },
    },
    user: { select: { fullName: true, email: true } },
  }

  if (format === 'csv') {
    const complaints = await prisma.complaint.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    })

    const header = [
      'Reference',
      'Title',
      'Category',
      'Department',
      'District',
      'Status',
      'Priority',
      'Submitted By',
      'Submitted At',
    ]
    const rows = complaints.map((c) => [
      c.referenceNumber,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category.name,
      c.category.department.name,
      c.district ?? '',
      c.status,
      c.priority,
      c.user?.fullName ?? 'Guest',
      new Date(c.createdAt).toLocaleDateString('en-GB'),
    ])

    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="lankafix-complaints-${Date.now()}.csv"`,
      },
    })
  }

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
    }),
    prisma.complaint.count({ where }),
  ])

  return NextResponse.json({
    complaints,
    total,
    pages: Math.ceil(total / LIMIT),
    page,
  })
}
