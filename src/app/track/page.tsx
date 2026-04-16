import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TrackClient from './TrackClient'

export const metadata = {
  title: 'Track Your Report — LankaFix',
  description: 'Enter your reference number to check the status of your complaint.',
}

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </main>
        }
      >
        <TrackClient />
      </Suspense>
      <Footer />
    </>
  )
}
