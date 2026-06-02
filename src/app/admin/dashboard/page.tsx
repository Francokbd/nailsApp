'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, CheckCircle2, AlertCircle, TrendingUp, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Appointment, AppointmentStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { formatTime, formatCurrency, isToday, cn } from '@/lib/utils'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

function AppointmentCard({ apt, onStatusChange }: { apt: Appointment; onStatusChange: (id: string, s: AppointmentStatus) => void }) {
  const statuses: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled']

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(0_0%_12%)] bg-[hsl(0_0%_6%)] hover:border-[hsl(0_0%_18%)] transition-all">
      <div className="w-10 h-10 rounded-lg bg-[hsl(0_0%_9%)] flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-[hsl(340_80%_73%)]">{formatTime(apt.scheduled_at)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm text-[hsl(0_0%_95%)] truncate">{apt.client_name}</p>
          <StatusBadge status={apt.status} />
        </div>
        <p className="text-xs text-[hsl(0_0%_50%)] mt-0.5">
          {apt.service?.name} · {apt.barber?.name}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <select
          value={apt.status}
          onChange={(e) => onStatusChange(apt.id, e.target.value as AppointmentStatus)}
          className="text-xs bg-[hsl(0_0%_9%)] border border-[hsl(0_0%_16%)] rounded-lg px-2 py-1.5 text-[hsl(0_0%_75%)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[hsl(340_80%_70%)]"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = () => {
    fetch('/api/appointments')
      .then((r) => r.json())
      .then((data) => { setAppointments(data); setLoading(false) })
  }

  useEffect(() => { fetchAppointments() }, [])

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchAppointments()
  }

  const todayApts = appointments.filter((a) => isToday(a.scheduled_at))
  const pendingCount = todayApts.filter((a) => a.status === 'pending').length
  const confirmedCount = todayApts.filter((a) => a.status === 'confirmed').length
  const completedCount = todayApts.filter((a) => a.status === 'completed').length
  const revenue = todayApts
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.service?.price ?? 0), 0)

  const upcomingApts = appointments.filter((a) => {
    const d = new Date(a.scheduled_at)
    return d >= new Date() && a.status !== 'cancelled'
  }).slice(0, 8)

  const todayStr = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1 capitalize">{todayStr}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Turnos hoy', value: todayApts.length, icon: Calendar, color: 'text-blue-400' },
          { label: 'Pendientes', value: pendingCount, icon: AlertCircle, color: 'text-yellow-400' },
          { label: 'Confirmados', value: confirmedCount, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Recaudación', value: formatCurrency(revenue), icon: TrendingUp, color: 'text-[hsl(340_80%_73%)]' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[hsl(0_0%_50%)]">{label}</p>
              <Icon className={cn('w-4 h-4', color)} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {/* Today's appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[hsl(0_0%_85%)]">Próximos turnos</h2>
          <a href="/admin/dashboard/agenda" className="text-xs text-[hsl(340_80%_73%)] hover:underline">
            Ver agenda completa →
          </a>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-[hsl(0_0%_8%)] animate-pulse" />
            ))}
          </div>
        ) : upcomingApts.length === 0 ? (
          <div className="text-center py-12 text-[hsl(0_0%_40%)]">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay turnos próximos</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingApts.map((apt) => (
              <AppointmentCard key={apt.id} apt={apt} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {/* Today's summary by barber */}
      {todayApts.length > 0 && (
        <div>
          <h2 className="font-semibold text-[hsl(0_0%_85%)] mb-4">Hoy por barbero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['bar_001', 'bar_002', 'bar_003'].map((barberId) => {
              const barberApts = todayApts.filter((a) => a.barber_id === barberId)
              if (barberApts.length === 0) return null
              const barber = barberApts[0].barber
              return (
                <Card key={barberId} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={barber?.photo_url} alt={barber?.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium">{barber?.name.split(' ')[0]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[hsl(0_0%_45%)]" />
                    <span className="text-sm text-[hsl(0_0%_65%)]">{barberApts.length} turnos</span>
                  </div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {barberApts.map((a) => (
                      <StatusBadge key={a.id} status={a.status} />
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
