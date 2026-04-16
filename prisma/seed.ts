import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const departmentData = [
  { name: 'Roads & Highways', contactEmail: 'roads@lankafix.lk' },
  { name: 'Electrical Department', contactEmail: 'electrical@lankafix.lk' },
  { name: 'Drainage Department', contactEmail: 'drainage@lankafix.lk' },
  { name: 'Waste Management', contactEmail: 'waste@lankafix.lk' },
  { name: 'Water Board', contactEmail: 'water@lankafix.lk' },
  { name: 'Municipal Services', contactEmail: 'municipal@lankafix.lk' },
  { name: 'Environmental Department', contactEmail: 'environment@lankafix.lk' },
  { name: 'General Administration', contactEmail: 'admin@lankafix.lk' },
]

async function main() {
  const existing = await prisma.department.count()
  if (existing > 0) {
    console.log('Seed data already exists — skipping.')
    return
  }

  const depts = await prisma.$transaction(
    departmentData.map((d) => prisma.department.create({ data: d }))
  )

  const deptMap = Object.fromEntries(depts.map((d) => [d.name, d.id]))

  const categoryData = [
    { name: 'Road Damage (Potholes, Cracks)', deptName: 'Roads & Highways' },
    { name: 'Footpath / Pavement', deptName: 'Roads & Highways' },
    { name: 'Street Lighting', deptName: 'Electrical Department' },
    { name: 'Drainage & Flooding', deptName: 'Drainage Department' },
    { name: 'Waste Collection', deptName: 'Waste Management' },
    { name: 'Illegal Dumping', deptName: 'Environmental Department' },
    { name: 'Water Supply', deptName: 'Water Board' },
    { name: 'Public Property Damage', deptName: 'Municipal Services' },
    { name: 'Other', deptName: 'General Administration' },
  ]

  await prisma.category.createMany({
    data: categoryData.map((c) => ({
      name: c.name,
      departmentId: deptMap[c.deptName],
    })),
  })

  const hashedPassword = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.create({
    data: {
      fullName: 'System Admin',
      email: 'admin@lankafix.lk',
      password: hashedPassword,
      isAdmin: true,
    },
  })

  console.log('Seed complete — departments, categories, and admin user created.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
