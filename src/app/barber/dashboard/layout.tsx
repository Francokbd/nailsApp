'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Calendar, TrendingUp, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/barber/dashboard', label: 'Mi agenda', icon: Calendar },
  { href: '/barber/dashboard/ganancias', label: 'Ganancias', icon: TrendingUp },
]

async function logout(router: ReturnType<typeof useRouter>) {
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL)
  if (hasSupabase) {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
  } else {
    localStorage.removeItem('admin_auth')
    localStorage.removeItem('demo_role')
    localStorage.removeItem('demo_barber_id')
  }
  router.push('/admin/login')
}

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [barberName, setBarberName] = useState('Mi panel')

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const auth = localStorage.getItem('admin_auth')
      if (!auth) { router.push('/admin/login'); return }
      localStorage.setItem('demo_barber_id', 'bar_001')
      setBarberName('Valentina Méndez')
      return
    }

    async function getBarberName() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('barber_id')
        .eq('id', user.id)
        .single()

      if (profile?.barber_id) {
        const res = await fetch('/api/barbers')
        const barbers = await res.json()
        const barber = barbers.find((b: { id: string; name: string }) => b.id === profile.barber_id)
        if (barber) setBarberName(barber.name)
      }
    }

    getBarberName()
  }, [router])

  return (
    <div className="min-h-screen bg-[hsl(0_0%_3.9%)] flex">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 flex-col border-r border-[hsl(0_0%_10%)] fixed inset-y-0 left-0 bg-[hsl(0_0%_4.5%)]">
        <div className="p-4 border-b border-[hsl(0_0%_10%)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(340_80%_70%)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none truncate">{barberName}</p>
              <p className="text-[10px] text-[hsl(0_0%_45%)] mt-0.5">Panel técnica</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all',
                pathname === href
                  ? 'bg-[hsl(340_80%_70%/0.12)] text-[hsl(340_80%_73%)] font-medium'
                  : 'text-[hsl(0_0%_55%)] hover:text-[hsl(0_0%_85%)] hover:bg-[hsl(0_0%_8%)]'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[hsl(0_0%_10%)]">
          <button
            onClick={() => logout(router)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[hsl(0_0%_45%)] hover:text-red-400 hover:bg-red-500/5 w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-[hsl(0_0%_10%)] h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(340_80%_70%)] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="font-bold text-sm truncate max-w-[140px]">{barberName}</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-[hsl(0_0%_5%)] border-b border-[hsl(0_0%_12%)] p-3" onClick={(e) => e.stopPropagation()}>
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm',
                  pathname === href ? 'bg-[hsl(340_80%_70%/0.12)] text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_65%)]'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => logout(router)}
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm text-red-400 w-full mt-1"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-56 pt-14 md:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
