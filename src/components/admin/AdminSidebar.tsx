'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, FileText, LogOut, Shield, Users, Building2, Map } from 'lucide-react'

interface Props {
  userName: string
  userEmail: string
  departmentId: number | null
  departmentName: string | null
}

export default function AdminSidebar({ userName, userEmail, departmentId, departmentName }: Props) {
  const pathname = usePathname()
  const isSuperAdmin = departmentId === null

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, always: true },
    { href: '/admin/complaints', label: 'Complaints', icon: FileText, always: true },
    { href: '/admin/hotzones', label: 'Hotzone Map', icon: Map, always: true },
    { href: '/admin/users', label: 'Users', icon: Users, always: false },
    { href: '/admin/departments', label: 'Departments', icon: Building2, always: false },
  ].filter((item) => item.always || isSuperAdmin)

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">LankaFix</p>
            <p className="text-xs text-gray-400">Admin Portal</p>
          </div>
        </Link>
      </div>

      {departmentName && (
        <div className="mx-3 mt-3 px-3 py-2 bg-green-50 rounded-xl border border-green-100">
          <p className="text-xs text-green-600 font-medium truncate">{departmentName}</p>
          <p className="text-xs text-green-500">Department Admin</p>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-green-700">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/auth' })}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
