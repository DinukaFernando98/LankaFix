import { LayoutDashboard } from 'lucide-react'

export default function AdminPage() {
  return (
    <main className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-4">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LayoutDashboard className="w-7 h-7 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Coming in Phase 5</h1>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          The admin dashboard is under development.
        </p>
      </div>
    </main>
  )
}
