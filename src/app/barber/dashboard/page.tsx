'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Appointment, AppointmentStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { formatTime, formatCurrency, isToday, cn } from '@/lib/utils'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

async function getBarberId(): Promise<string | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return localStorage.getItem('demo_barber_id') || 'bar_001'
  }

  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('barber_id')
    .eq('id', user.id)
    .single()

  return profile?.barber_id ?? null
}

export default function BarberDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [barberId, setBarberId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchAppointments = async (bid: string) => {
    const res = await fetch(`/api/appointments?barber_id=${bid}`)
    const data = await res.json()
    setAppointments(data)
    setLoading(false)
  }

  useEffect(() => {
    getBarberId().then((id) => {
      if (id) {
        setBarberId(id)
        fetchAppointments(id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (barberId) fetchAppointments(barberId)
  }

  const dayApts = appointments
    .filter((a) => isSameDay(new Date(a.scheduled_at), selectedDate))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const todayApts = appointments.filter((a) => isToday(a.scheduled_at))
  const pendingToday = todayApts.filter((a) => a.status === 'pending').length
  const completedToday = todayApts.filter((a) => a.status === 'completed').length

  const dateLabel = format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
  const isTodaySelected = isToday(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Mi agenda</h1>
        <p className="text-sm text-[hsl(0_0%_45%)] mt-1 capitalize">{dateLabel}</p>
      </div>

      {/* Stats del día */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[hsl(0_0%_50%)]">Turnos hoy</p>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{todayApts.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[hsl(0_0%_50%)]">Pendientes</p>
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold">{pendingToday}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[hsl(0_0%_50%)]">Completados</p>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold">{completedToday}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[hsl(0_0%_50%)]">Recaudado hoy</p>
            <span className="text-[hsl(340_80%_73%)] text-xs font-bold">$</span>
          </div>
          <p className="text-2xl font-bold">
            {formatCurrency(
              todayApts
                .filter((a) => a.status === 'completed')
                .reduce((s, a) => s + (a.service?.price ?? 0), 0)
            )}
          </p>
        </Card>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => subDays(d, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={isTodaySelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-sm text-[hsl(0_0%_50%)]">{dayApts.length} turno{dayApts.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Appointment list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[hsl(0_0%_8%)] animate-pulse" />
          ))}
        </div>
      ) : dayApts.length === 0 ? (
        <div className="text-center py-16 text-[hsl(0_0%_35%)]">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No tenés turnos para este día</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayApts.map((apt) => (
            <Card key={apt.id} className={cn('p-4 transition-all hover:border-[hsl(0_0%_18%)]', apt.status === 'cancelled' && 'opacity-50')}>
              <div className="flex items-start gap-4">
                {/* Time */}
                <div className="shrink-0 text-center min-w-[48px]">
                  <p className="text-base font-bold text-[hsl(340_80%_73%)]">{formatTime(apt.scheduled_at)}</p>
                  <div className="flex items-center gap-1 text-[10px] text-[hsl(0_0%_40%)]">
                    <Clock className="w-2.5 h-2.5" />
                    {apt.duration_minutes}m
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-[hsl(0_0%_95%)]">{apt.client_name}</p>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-sm text-[hsl(0_0%_50%)]">
                    {apt.service?.name}
                    {apt.service && <span className="ml-2 text-[hsl(340_80%_73%)] font-medium">{formatCurrency(apt.service.price)}</span>}
                  </p>
                  <p className="text-xs text-[hsl(0_0%_40%)] mt-1">{apt.client_phone}</p>

                  {/* Quick status actions */}
                  {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                    <div className="flex gap-2 mt-3">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(apt.id, 'confirmed')}
                          className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
                        >
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, 'cancelled')}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
