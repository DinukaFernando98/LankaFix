import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Search } from 'lucide-react'

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center min-h-screen bg-gray-50 pt-16">
        <div className="text-center px-4">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming in Phase 4</h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            The complaint tracking page is under development.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
