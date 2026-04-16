import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import Categories from '@/components/landing/Categories'
import Features from '@/components/landing/Features'
import CtaBanner from '@/components/landing/CtaBanner'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Categories />
        <Features />
        <CtaBanner />
      </main>
      <Footer />
    </>
  )
}
