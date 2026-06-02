'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[hsl(0_0%_12%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[hsl(340_80%_70%)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-[hsl(0_0%_98%)] text-sm tracking-tight">
            Nail Studio
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/#servicios">
            <Button variant="ghost" size="sm">
              Servicios
            </Button>
          </Link>
          <Link href="/reserva">
            <Button size="sm">
              Reservar turno
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
