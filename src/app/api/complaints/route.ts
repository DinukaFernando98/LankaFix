import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { generateReferenceNumber } from '@/lib/referenceNumber'
import { z } from 'zod'

const complaintSchema = z.object({
  categoryId: z.number().int().positive(),
  title: z.string().min(3).max(200),
  description: z.string().min(20),
  photoUrl: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  address: z.string().optional(),
  district: z.string().min(1),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = complaintSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const data = result.data
    const referenceNumber = await generateReferenceNumber()

    const complaint = await prisma.complaint.create({
      data: {
        referenceNumber,
        userId: session.user.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        photoUrl: data.photoUrl || null,
        priority: data.priority,
        address: data.address || null,
        district: data.district,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        status: 'Open',
        statusHistory: {
          create: {
            status: 'Open',
            notes: 'Complaint received and logged.',
          },
        },
      },
    })

    return NextResponse.json(
      { referenceNumber: complaint.referenceNumber, complaintId: complaint.id },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to submit complaint' }, { status: 500 })
  }
}
