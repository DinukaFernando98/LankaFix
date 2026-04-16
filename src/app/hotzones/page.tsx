import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HotzoneClient from './HotzoneClient'

export const metadata = {
  title: 'Hotzone Map — LankaFix',
  description:
    'AI-powered K-Means clustering reveals the highest concentration areas for civic issues across Sri Lanka.',
}

export default function HotzonesPage() {
  return (
    <>
      <Navbar />
      <HotzoneClient />
      <Footer />
    </>
  )
}
