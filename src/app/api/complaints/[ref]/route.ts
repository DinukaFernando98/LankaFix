import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params

    const complaint = await prisma.complaint.findUnique({
      where: { referenceNumber: ref.toUpperCase() },
      include: {
        category: {
          include: { department: { select: { name: true } } },
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' },
        },
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    return NextResponse.json(complaint)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 })
  }
}
