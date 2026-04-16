'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Loader2, X, Users, Shield, Building2 } from 'lucide-react'

interface UserRow {
  id: string
  fullName: string
  email: string
  mobile: string | null
  isAdmin: boolean
  departmentId: number | null
  createdAt: string
  department: { name: string } | null
  _count: { complaints: number }
}

interface Department {
  id: number
  name: string
}

interface Props {
  currentUserId: string
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const drawerVariants: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  exit: { x: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
}

interface EditDrawerProps {
  user: UserRow
  departments: Department[]
  onClose: () => void
  onSaved: () => void
}

function EditRoleDrawer({ user, departments, onClose, onSaved }: EditDrawerProps) {
  const [isAdmin, setIsAdmin] = useState(user.isAdmin)
  const [departmentId, setDepartmentId] = useState<number | null>(user.departmentId)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin, departmentId: isAdmin ? departmentId : null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed')
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save changes.')
      setIsSaving(false)
    }
  }

  return (
    <>
      <motion.div
        variants={overlayVariants} initial="hidden" animate="show" exit="exit"
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        variants={drawerVariants} initial="hidden" animate="show" exit="exit"
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900">{user.fullName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Admin Access</p>
              <p className="text-xs text-gray-500 mt-0.5">Grant access to the admin portal</p>
            </div>
            <button
              onClick={() => { setIsAdmin(!isAdmin); if (isAdmin) setDepartmentId(null) }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isAdmin ? 'bg-green-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${isAdmin ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {isAdmin && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Admin Role</label>
              <div className="space-y-2">
                <button
                  onClick={() => setDepartmentId(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                    departmentId === null
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-medium">System Administrator</p>
                    <p className="text-xs opacity-70">Full access to all departments and settings</p>
                  </div>
                </button>

                <p className="text-xs font-medium text-gray-400 px-1 pt-1">Department Admin</p>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setDepartmentId(dept.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                      departmentId === dept.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{dept.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default function UsersTable({ currentUserId }: Props) {
  const [users, setUsers] = useState<UserRow[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, deptsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/departments'),
      ])
      const [usersData, deptsData] = await Promise.all([usersRes.json(), deptsRes.json()])
      setUsers(usersData)
      setDepartments(deptsData)
    } catch {
      /* silent */
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function roleBadge(user: UserRow) {
    if (!user.isAdmin) return <span className="text-xs text-gray-400">User</span>
    if (user.departmentId === null)
      return <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full"><Shield className="w-3 h-3" />System Admin</span>
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
        <Building2 className="w-3 h-3" />
        {user.department?.name ?? 'Dept Admin'}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Name', 'Email', 'Mobile', 'Role', 'Complaints', 'Joined', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-700">{u.fullName.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{u.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{u.mobile || '—'}</td>
                  <td className="px-5 py-3.5">{roleBadge(u)}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{u._count.complaints}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Edit Role
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selectedUser && (
          <EditRoleDrawer
            user={selectedUser}
            departments={departments}
            onClose={() => setSelectedUser(null)}
            onSaved={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
