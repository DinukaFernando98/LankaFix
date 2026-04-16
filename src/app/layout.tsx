import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import AuthModalProvider from '@/components/providers/AuthModalProvider'
import AuthModal from '@/components/AuthModal'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LankaFix',
  description: "Sri Lanka's civic issue reporting platform. Report, track, and resolve local issues with your community.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <AuthModalProvider>
            {children}
            <AuthModal />
          </AuthModalProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
