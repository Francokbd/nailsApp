'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Calendar, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Appointment } from '@/types'
import { formatCurrency, isToday } from '@/lib/utils'
import { startOfWeek, startOfMonth, isWithinInterval, endOfWeek, endOfMonth } from 'date-fns'

async function getBarberId(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return localStorage.getItem('demo_barber_id') || 'bar_001'
  }
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('barber_id').eq('id', user.id).single()
  return profile?.barber_id ?? null
}

export default function GananciasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBarberId().then((id) => {
      if (!id) { setLoading(false); return }
      fetch(`/api/appointments?barber_id=${id}`)
        .then((r) => r.json())
        .then((data) => { setAppointments(data); setLoading(false) })
    })
  }, [])

  const completed = appointments.filter((a) => a.status === 'completed')
  const now = new Date()

  const todayRevenue = completed
    .filter((a) => isToday(a.scheduled_at))
    .reduce((s, a) => s + (a.service?.price ?? 0), 0)

  const weekRevenue = completed
    .filter((a) => isWithinInterval(new Date(a.scheduled_at), {
      start: startOfWeek(now, { weekStartsOn: 1 }),
      end: endOfWeek(now, { weekStartsOn: 1 }),
    }))
    .reduce((s, a) => s + (a.service?.price ?? 0), 0)

  const monthRevenue = completed
    .filter((a) => isWithinInterval(new Date(a.scheduled_at), {
      start: startOfMonth(now),
      end: endOfMonth(now),
    }))
    .reduce((s, a) => s + (a.service?.price ?? 0), 0)

  const totalRevenue = completed.reduce((s, a) => s + (a.service?.price ?? 0), 0)

  // Top services
  const serviceCount: Record<string, { name: string; count: number; revenue: number }> = {}
  completed.forEach((a) => {
    if (!a.service) return
    if (!serviceCount[a.service_id]) {
      serviceCount[a.service_id] = { name: a.service.name, count: 0, revenue: 0 }
    }
    serviceCount[a.service_id].count++
    serviceCount[a.service_id].revenue += a.service.price
  })
  const topServices = Object.values(serviceCount).sort((a, b) => b.revenue - a.revenue)

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[hsl(0_0%_8%)] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mis ganancias</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1">Solo turnos completados</p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Hoy', value: todayRevenue, icon: Calendar, color: 'text-blue-400' },
          { label: 'Esta semana', value: weekRevenue, icon: TrendingUp, color: 'text-[hsl(340_80%_73%)]' },
          { label: 'Este mes', value: monthRevenue, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Total histórico', value: totalRevenue, icon: TrendingUp, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[hsl(0_0%_50%)]">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold">{formatCurrency(value)}</p>
          </Card>
        ))}
      </div>

      {/* Top services */}
      {topServices.length > 0 && (
        <div>
          <h2 className="font-semibold text-[hsl(0_0%_85%)] mb-3">Servicios más realizados</h2>
          <div className="space-y-2">
            {topServices.map(({ name, count, revenue }) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-xl border border-[hsl(0_0%_12%)] bg-[hsl(0_0%_6%)]">
                <div>
                  <p className="text-sm font-medium text-[hsl(0_0%_90%)]">{name}</p>
                  <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">{count} vez{count !== 1 ? 'es' : ''}</p>
                </div>
                <p className="font-bold text-[hsl(340_80%_73%)]">{formatCurrency(revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent completed */}
      <div>
        <h2 className="font-semibold text-[hsl(0_0%_85%)] mb-3">Últimos completados</h2>
        <div className="space-y-2">
          {completed.slice(-8).reverse().map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl border border-[hsl(0_0%_12%)] bg-[hsl(0_0%_6%)]">
              <div>
                <p className="text-sm font-medium text-[hsl(0_0%_90%)]">{apt.client_name}</p>
                <p className="text-xs text-[hsl(0_0%_45%)] mt-0.5">
                  {apt.service?.name} · {new Date(apt.scheduled_at).toLocaleDateString('es-AR')}
                </p>
              </div>
              <p className="font-bold text-green-400">{apt.service ? formatCurrency(apt.service.price) : ''}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
