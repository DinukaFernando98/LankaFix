import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Urgent']),
  notes: z.string().optional(),
})

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

  await prisma.$transaction([
    prisma.complaint.update({
      where: { id: Number(id) },
      data: { status },
    }),
    prisma.statusHistory.create({
      data: { complaintId: Number(id), status, notes: notes || null },
    }),
  ])

  return NextResponse.json({ success: true })
}
