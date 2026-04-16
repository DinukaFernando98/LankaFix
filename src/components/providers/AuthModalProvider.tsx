'use client'

import { createContext, useContext, useState, useCallback } from 'react'

interface AuthModalContextValue {
  isOpen: boolean
  callbackUrl: string
  openModal: (callbackUrl?: string) => void
  closeModal: () => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider')
  return ctx
}

export default function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState('/')

  const openModal = useCallback((url = '/') => {
    setCallbackUrl(url)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <AuthModalContext.Provider value={{ isOpen, callbackUrl, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  )
}
