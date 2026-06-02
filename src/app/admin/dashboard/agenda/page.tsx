'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Appointment, AppointmentStatus } from '@/types'
import { STATUS_LABELS, STATUS_COLORS } from '@/types'
import { formatTime, formatCurrency, cn } from '@/lib/utils'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 9) // 9am - 8pm

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')

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

  const dayApts = appointments.filter((a) =>
    isSameDay(new Date(a.scheduled_at), selectedDate)
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  // Week view: current week Mon-Sat
  const weekStart = (() => {
    const d = new Date(selectedDate)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    return d
  })()

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i))

  const dateLabel = format(selectedDate, "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Agenda</h1>
          <p className="text-sm text-[hsl(0_0%_45%)] capitalize mt-1">{dateLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[hsl(0_0%_14%)] overflow-hidden">
            <button
              onClick={() => setView('day')}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors',
                view === 'day' ? 'bg-[hsl(340_80%_70%/0.15)] text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)]'
              )}
            >
              Día
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'px-3 py-1.5 text-sm transition-colors border-l border-[hsl(0_0%_14%)]',
                view === 'week' ? 'bg-[hsl(340_80%_70%/0.15)] text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_50%)] hover:text-[hsl(0_0%_80%)]'
              )}
            >
              Semana
            </button>
          </div>

          <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => subDays(d, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day view */}
      {view === 'day' && (
        <div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-[hsl(0_0%_8%)] animate-pulse" />
              ))}
            </div>
          ) : dayApts.length === 0 ? (
            <div className="text-center py-20 text-[hsl(0_0%_35%)]">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No hay turnos para este día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dayApts.map((apt) => (
                <Card key={apt.id} className={cn(
                  'p-4 transition-all hover:border-[hsl(0_0%_18%)]',
                  apt.status === 'cancelled' && 'opacity-50'
                )}>
                  <div className="flex items-start gap-4">
                    {/* Time column */}
                    <div className="shrink-0 text-center">
                      <p className="text-base font-bold text-[hsl(340_80%_73%)]">{formatTime(apt.scheduled_at)}</p>
                      <p className="text-[10px] text-[hsl(0_0%_40%)]">{apt.duration_minutes}min</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-semibold text-[hsl(0_0%_95%)]">{apt.client_name}</p>
                          <p className="text-sm text-[hsl(0_0%_50%)] mt-0.5">
                            {apt.service?.name} · <span className="text-[hsl(340_80%_73%)]">{apt.service ? formatCurrency(apt.service.price) : ''}</span>
                          </p>
                          <p className="text-xs text-[hsl(0_0%_40%)] mt-1">
                            Barbero: {apt.barber?.name}
                          </p>
                        </div>
                        <StatusBadge status={apt.status} />
                      </div>

                      {/* Status actions */}
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[])
                          .filter((s) => s !== apt.status)
                          .map((s) => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(apt.id, s)}
                              className={cn(
                                'text-xs px-2.5 py-1 rounded-lg border transition-all',
                                s === 'completed' && 'border-green-500/30 text-green-400 hover:bg-green-500/10',
                                s === 'confirmed' && 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10',
                                s === 'cancelled' && 'border-red-500/30 text-red-400 hover:bg-red-500/10',
                                s === 'pending' && 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10',
                              )}
                            >
                              Marcar {STATUS_LABELS[s].toLowerCase()}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 min-w-[600px]">
            {weekDays.map((day) => {
              const dayApts = appointments.filter((a) => isSameDay(new Date(a.scheduled_at), day))
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())

              return (
                <div key={day.toISOString()}>
                  <button
                    onClick={() => { setSelectedDate(day); setView('day') }}
                    className={cn(
                      'w-full p-2 rounded-xl text-center mb-2 transition-all border',
                      isSelected ? 'border-[hsl(340_80%_70%)] bg-[hsl(340_80%_70%/0.1)]' :
                      isToday ? 'border-[hsl(340_80%_70%/0.3)] bg-transparent' :
                      'border-transparent hover:border-[hsl(0_0%_14%)]'
                    )}
                  >
                    <p className={cn('text-xs uppercase font-medium', isSelected ? 'text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_45%)]')}>
                      {format(day, 'EEE', { locale: es })}
                    </p>
                    <p className={cn('text-xl font-bold', isSelected ? 'text-[hsl(340_80%_73%)]' : isToday ? 'text-[hsl(0_0%_95%)]' : 'text-[hsl(0_0%_70%)]')}>
                      {format(day, 'd')}
                    </p>
                    {dayApts.length > 0 && (
                      <p className="text-[10px] text-[hsl(0_0%_45%)]">{dayApts.length} turno{dayApts.length > 1 ? 's' : ''}</p>
                    )}
                  </button>

                  <div className="space-y-1.5">
                    {dayApts.slice(0, 4).map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => { setSelectedDate(day); setView('day') }}
                        className={cn(
                          'p-2 rounded-lg text-xs cursor-pointer border transition-all',
                          apt.status === 'completed' && 'border-green-500/20 bg-green-500/5',
                          apt.status === 'confirmed' && 'border-blue-500/20 bg-blue-500/5',
                          apt.status === 'pending' && 'border-yellow-500/20 bg-yellow-500/5',
                          apt.status === 'cancelled' && 'border-[hsl(0_0%_12%)] bg-transparent opacity-40',
                        )}
                      >
                        <p className="font-medium text-[hsl(0_0%_85%)] truncate">{formatTime(apt.scheduled_at)}</p>
                        <p className="text-[hsl(0_0%_50%)] truncate">{apt.client_name}</p>
                      </div>
                    ))}
                    {dayApts.length > 4 && (
                      <p className="text-[10px] text-[hsl(0_0%_40%)] text-center">+{dayApts.length - 4} más</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
