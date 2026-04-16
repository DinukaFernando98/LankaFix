import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  isAdmin: z.boolean(),
  departmentId: z.number().int().positive().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin || session.user.departmentId !== null) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  if (id === session.user.id) {
    return NextResponse.json({ error: 'Cannot modify your own role' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { isAdmin, departmentId } = parsed.data

  const user = await prisma.user.update({
    where: { id },
    data: {
      isAdmin,
      departmentId: isAdmin ? departmentId : null,
    },
    select: { id: true, fullName: true, isAdmin: true, departmentId: true },
  })

  return NextResponse.json(user)
}
