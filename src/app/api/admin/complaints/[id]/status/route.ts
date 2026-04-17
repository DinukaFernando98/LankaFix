import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notifyStatusUpdated } from '@/lib/notify'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Urgent']),
  notes: z.string().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const history = await prisma.statusHistory.findMany({
    where: { complaintId: Number(id) },
    orderBy: { changedAt: 'desc' },
  })

  return NextResponse.json(history)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { status, notes } = parsed.data
  const complaintId = Number(id)

  const [complaint] = await prisma.$transaction([
    prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
      select: { referenceNumber: true, title: true },
    }),
    prisma.statusHistory.create({
      data: { complaintId, status, notes: notes || null },
    }),
  ])

  notifyStatusUpdated({
    complaintId,
    referenceNumber: complaint.referenceNumber,
    title: complaint.title,
    status,
    notes,
  })

  return NextResponse.json({ success: true })
}
