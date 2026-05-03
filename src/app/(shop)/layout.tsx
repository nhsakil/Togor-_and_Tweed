import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WhatsAppButton from '@/components/common/WhatsAppButton'
import BottomTabBar from '@/components/layout/BottomTabBar'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* announcement: 32px + mobile nav row1 50px + row2 ~38px = 120px | desktop: 32px + 60px + 45px = 137px */}
      <div className="h-[120px] md:h-[137px]" />
      {/* pb-[60px] reserves space for the fixed bottom tab bar on mobile */}
      <main className="min-h-screen pb-[60px] md:pb-0">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <BottomTabBar />
    </>
  )
}
