import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactClient from './ContactClient'

export const metadata = {
  title: 'Contact Us — LankaFix',
  description: 'Get in touch with the LankaFix team. We\'re here to help with questions about reporting civic issues across Sri Lanka.',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ContactClient />
      </main>
      <Footer />
    </>
  )
}
