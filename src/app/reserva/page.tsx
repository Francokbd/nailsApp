'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Clock, ChevronLeft, ChevronRight, User, Phone, Check, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/navbar'
import type { Service, Barber, TimeSlot, BookingState } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

const STEP_LABELS = ['Servicio', 'Técnica & Horario', 'Confirmar']

export default function ReservaPage() {
  const router = useRouter()

  const [state, setState] = useState<BookingState>({
    step: 1,
    selectedService: null,
    selectedBarber: null,
    selectedDate: null,
    selectedTime: null,
    clientName: '',
    clientPhone: '',
  })

  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Available dates (next 14 days excluding Sunday)
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1)).filter(
    (d) => d.getDay() !== 0 // exclude Sundays
  )

  useEffect(() => {
    fetch('/api/services').then((r) => r.json()).then(setServices)
    fetch('/api/barbers').then((r) => r.json()).then(setBarbers)
  }, [])

  useEffect(() => {
    if (!state.selectedBarber || !state.selectedDate) return
    setLoading(true)
    fetch(`/api/slots?barber_id=${state.selectedBarber.id}&date=${state.selectedDate}`)
      .then((r) => r.json())
      .then((data) => { setSlots(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [state.selectedBarber, state.selectedDate])

  const canAdvance = () => {
    if (state.step === 1) return !!state.selectedService
    if (state.step === 2) return !!(state.selectedBarber && state.selectedDate && state.selectedTime)
    if (state.step === 3) return state.clientName.length >= 2 && state.clientPhone.length >= 6
    return false
  }

  const handleNext = () => {
    if (state.step < 3) setState((s) => ({ ...s, step: (s.step + 1) as 1 | 2 | 3 }))
  }

  const handleBack = () => {
    if (state.step > 1) setState((s) => ({ ...s, step: (s.step - 1) as 1 | 2 | 3 }))
  }

  const handleSubmit = async () => {
    if (!state.selectedBarber || !state.selectedService || !state.selectedDate || !state.selectedTime) return

    setSubmitting(true)
    setError('')

    const [hour, minute] = state.selectedTime.split(':').map(Number)
    const scheduledAt = new Date(state.selectedDate)
    scheduledAt.setHours(hour, minute, 0, 0)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barber_id: state.selectedBarber.id,
          service_id: state.selectedService.id,
          client_name: state.clientName.trim(),
          client_phone: state.clientPhone.trim(),
          scheduled_at: scheduledAt.toISOString(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Hubo un error al reservar. Intentá de nuevo.')
        setSubmitting(false)
        return
      }

      router.push(`/reserva/${data.id}`)
    } catch {
      setError('Error de conexión. Verificá tu internet e intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_3.9%)]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1
              const isActive = state.step === stepNum
              const isDone = state.step > stepNum
              return (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all',
                      isActive && 'bg-[hsl(340_80%_70%)] border-[hsl(340_80%_70%)] text-black',
                      isDone && 'bg-[hsl(340_80%_70%/0.2)] border-[hsl(340_80%_70%/0.5)] text-[hsl(340_80%_73%)]',
                      !isActive && !isDone && 'bg-transparent border-[hsl(0_0%_20%)] text-[hsl(0_0%_45%)]'
                    )}>
                      {isDone ? <Check className="w-3 h-3" /> : stepNum}
                    </div>
                    <span className={cn(
                      'text-sm hidden sm:block',
                      isActive && 'text-[hsl(0_0%_95%)] font-medium',
                      isDone && 'text-[hsl(340_80%_73%)]',
                      !isActive && !isDone && 'text-[hsl(0_0%_40%)]'
                    )}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={cn('h-px flex-1 transition-colors', isDone ? 'bg-[hsl(340_80%_70%/0.4)]' : 'bg-[hsl(0_0%_14%)]')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1 — Service */}
        {state.step === 1 && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">¿Qué servicio querés?</h1>
            <p className="text-[hsl(0_0%_50%)] text-sm mb-6">Elegí el servicio que más te conviene.</p>

            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setState((s) => ({ ...s, selectedService: service }))}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border transition-all',
                    state.selectedService?.id === service.id
                      ? 'border-[hsl(340_80%_70%)] bg-[hsl(340_80%_70%/0.08)]'
                      : 'border-[hsl(0_0%_14%)] bg-[hsl(0_0%_6%)] hover:border-[hsl(0_0%_22%)] hover:bg-[hsl(0_0%_7%)]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                        state.selectedService?.id === service.id
                          ? 'bg-[hsl(340_80%_70%/0.25)]'
                          : 'bg-[hsl(0_0%_10%)]'
                      )}>
                        <Sparkles className={cn(
                          'w-4 h-4',
                          state.selectedService?.id === service.id ? 'text-[hsl(340_80%_70%)]' : 'text-[hsl(0_0%_50%)]'
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-[hsl(0_0%_95%)]">{service.name}</p>
                        <p className="text-xs text-[hsl(0_0%_50%)] mt-0.5">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="font-bold text-[hsl(340_80%_73%)]">{formatCurrency(service.price)}</p>
                      <p className="text-xs text-[hsl(0_0%_45%)] flex items-center gap-1 justify-end mt-0.5">
                        <Clock className="w-3 h-3" />
                        {service.duration_minutes}min
                      </p>
                    </div>
                  </div>
                  {state.selectedService?.id === service.id && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-[hsl(340_80%_73%)]">
                      <Check className="w-3 h-3" />
                      Seleccionado
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Barber & Time */}
        {state.step === 2 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">¿Con quién y cuándo?</h1>
              <p className="text-[hsl(0_0%_50%)] text-sm">Elegí tu técnica y el horario que más te conviene.</p>
            </div>

            {/* Barber selection */}
            <div>
              <p className="text-sm font-medium text-[hsl(0_0%_70%)] mb-3">Técnica</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {barbers.map((barber) => (
                  <button
                    key={barber.id}
                    onClick={() => setState((s) => ({ ...s, selectedBarber: barber, selectedTime: null }))}
                    className={cn(
                      'p-3 rounded-2xl border transition-all text-center',
                      state.selectedBarber?.id === barber.id
                        ? 'border-[hsl(340_80%_70%)] bg-[hsl(340_80%_70%/0.08)]'
                        : 'border-[hsl(0_0%_14%)] bg-[hsl(0_0%_6%)] hover:border-[hsl(0_0%_22%)]'
                    )}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={barber.photo_url} alt={barber.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-medium text-[hsl(0_0%_95%)]">{barber.name.split(' ')[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date selection */}
            {state.selectedBarber && (
              <div>
                <p className="text-sm font-medium text-[hsl(0_0%_70%)] mb-3">Fecha</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.slice(0, 10).map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isSelected = state.selectedDate === dateStr
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setState((s) => ({ ...s, selectedDate: dateStr, selectedTime: null }))}
                        className={cn(
                          'flex flex-col items-center p-3 rounded-xl border transition-all shrink-0 min-w-[56px]',
                          isSelected
                            ? 'border-[hsl(340_80%_70%)] bg-[hsl(340_80%_70%/0.08)]'
                            : 'border-[hsl(0_0%_14%)] bg-[hsl(0_0%_6%)] hover:border-[hsl(0_0%_22%)]'
                        )}
                      >
                        <span className={cn('text-[10px] uppercase font-medium', isSelected ? 'text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_45%)]')}>
                          {format(date, 'EEE', { locale: es })}
                        </span>
                        <span className={cn('text-lg font-bold', isSelected ? 'text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_90%)]')}>
                          {format(date, 'd')}
                        </span>
                        <span className={cn('text-[10px]', isSelected ? 'text-[hsl(340_80%_73%)]' : 'text-[hsl(0_0%_45%)]')}>
                          {format(date, 'MMM', { locale: es })}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Time slots */}
            {state.selectedBarber && state.selectedDate && (
              <div>
                <p className="text-sm font-medium text-[hsl(0_0%_70%)] mb-3">Horario disponible</p>
                {loading ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="h-10 rounded-lg bg-[hsl(0_0%_10%)] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {slots.map(({ time, available }) => (
                      <button
                        key={time}
                        disabled={!available}
                        onClick={() => setState((s) => ({ ...s, selectedTime: time }))}
                        className={cn(
                          'h-10 rounded-lg text-sm font-medium border transition-all',
                          !available && 'opacity-30 cursor-not-allowed border-[hsl(0_0%_12%)] bg-transparent text-[hsl(0_0%_35%)]',
                          available && state.selectedTime === time && 'border-[hsl(340_80%_70%)] bg-[hsl(340_80%_70%)] text-black',
                          available && state.selectedTime !== time && 'border-[hsl(0_0%_18%)] bg-[hsl(0_0%_8%)] text-[hsl(0_0%_80%)] hover:border-[hsl(340_80%_70%/0.5)] hover:bg-[hsl(340_80%_70%/0.08)]'
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Confirm */}
        {state.step === 3 && (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Confirmá tu turno</h1>
              <p className="text-[hsl(0_0%_50%)] text-sm">Solo tu nombre y teléfono — sin registro.</p>
            </div>

            {/* Summary */}
            <Card className="p-4 border-[hsl(340_80%_70%/0.2)] bg-[hsl(340_80%_70%/0.04)]">
              <p className="text-xs text-[hsl(340_80%_73%)] font-medium mb-3 uppercase tracking-wider">Resumen de tu reserva</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(0_0%_55%)]">Servicio</span>
                  <span className="text-sm font-medium">{state.selectedService?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(0_0%_55%)]">Técnica</span>
                  <span className="text-sm font-medium">{state.selectedBarber?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(0_0%_55%)]">Fecha</span>
                  <span className="text-sm font-medium">{state.selectedDate ? formatDate(state.selectedDate) : ''}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[hsl(0_0%_55%)]">Hora</span>
                  <span className="text-sm font-medium">{state.selectedTime}hs</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[hsl(0_0%_14%)]">
                  <span className="text-sm text-[hsl(0_0%_55%)]">Precio</span>
                  <span className="font-bold text-[hsl(340_80%_73%)]">
                    {state.selectedService ? formatCurrency(state.selectedService.price) : ''}
                  </span>
                </div>
              </div>
            </Card>

            {/* Client form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tu nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_40%)]" />
                  <Input
                    id="name"
                    placeholder="Juan Pérez"
                    className="pl-10"
                    value={state.clientName}
                    onChange={(e) => setState((s) => ({ ...s, clientName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (para confirmación)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_40%)]" />
                  <Input
                    id="phone"
                    placeholder="+54 11 1234-5678"
                    className="pl-10"
                    type="tel"
                    value={state.clientPhone}
                    onChange={(e) => setState((s) => ({ ...s, clientPhone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(0_0%_10%)]">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={state.step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Atrás
          </Button>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  s === state.step ? 'bg-[hsl(340_80%_70%)] w-4' : s < state.step ? 'bg-[hsl(340_80%_70%/0.5)]' : 'bg-[hsl(0_0%_20%)]'
                )}
              />
            ))}
          </div>

          {state.step < 3 ? (
            <Button onClick={handleNext} disabled={!canAdvance()} className="gap-2">
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canAdvance() || submitting} className="gap-2">
              {submitting ? 'Reservando...' : 'Confirmar turno'}
              {!submitting && <Check className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
