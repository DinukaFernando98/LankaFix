import { prisma } from './prisma'

export async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`)
  const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`)

  const count = await prisma.complaint.count({
    where: {
      createdAt: { gte: startOfYear, lt: endOfYear },
    },
  })

  return `CR-${year}-${String(count + 1).padStart(5, '0')}`
}
