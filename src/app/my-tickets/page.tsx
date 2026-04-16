import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MyTicketsClient from './MyTicketsClient'

export const metadata = { title: 'My Reports — LankaFix' }

export default async function MyTicketsPage() {
  const session = await auth()
  if (!session?.user) redirect('/')

  return (
    <>
      <Navbar />
      <MyTicketsClient />
    </>
  )
}
