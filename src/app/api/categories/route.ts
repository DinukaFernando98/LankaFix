import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { department: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
