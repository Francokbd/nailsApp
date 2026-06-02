'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Calendar, Clock, User, Phone, Sparkles, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/shared/navbar'
import type { Appointment } from '@/types'
import { formatDateTime, getEndTime, formatCurrency } from '@/lib/utils'
import { useParams } from 'next/navigation'

export default function ConfirmacionPage() {
  const params = useParams()
  const id = params?.id as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/appointments/${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setAppointment(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_3.9%)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(340_80%_70%)] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !appointment) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_3.9%)] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[hsl(0_0%_50%)] mb-4">No se encontró el turno.</p>
          <Link href="/reserva"><Button>Hacer una nueva reserva</Button></Link>
        </div>
      </div>
    )
  }

  const endTime = getEndTime(appointment.scheduled_at, appointment.duration_minutes)

  return (
    <div className="min-h-screen bg-[hsl(0_0%_3.9%)]">
      <Navbar />

      <div className="max-w-md mx-auto px-4 pt-28 pb-16">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Turno confirmado!</h1>
          <p className="text-[hsl(0_0%_50%)] text-sm">
            Te esperamos. Llegá 5 minutos antes.
          </p>
        </div>

        {/* Appointment card */}
        <Card className="p-6 border-[hsl(340_80%_70%/0.2)] mb-4">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-[hsl(340_80%_70%)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <div>
              <p className="text-xs text-[hsl(0_0%_45%)]">Reserva #{appointment.id.slice(-6).toUpperCase()}</p>
              <p className="text-sm font-medium">Nail Studio</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%)] flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-[hsl(340_80%_70%)]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(0_0%_45%)]">Fecha y hora</p>
                <p className="text-sm font-medium capitalize">{formatDateTime(appointment.scheduled_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%)] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[hsl(340_80%_70%)]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(0_0%_45%)]">Duración</p>
                <p className="text-sm font-medium">
                  {appointment.duration_minutes} min · hasta las {endTime}hs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%)] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[hsl(340_80%_70%)]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(0_0%_45%)]">Servicio</p>
                <p className="text-sm font-medium">
                  {appointment.service?.name} · {appointment.service ? formatCurrency(appointment.service.price) : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%)] flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-[hsl(340_80%_70%)]" />
              </div>
              <div>
                <p className="text-xs text-[hsl(0_0%_45%)]">Técnica</p>
                <p className="text-sm font-medium">{appointment.barber?.name}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[hsl(0_0%_12%)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[hsl(0_0%_10%)] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[hsl(0_0%_45%)]" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(0_0%_45%)]">A nombre de</p>
                  <p className="text-sm font-medium">
                    {appointment.client_name} · {appointment.client_phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Info box */}
        <div className="p-4 rounded-xl bg-[hsl(0_0%_7%)] border border-[hsl(0_0%_12%)] mb-6 text-sm text-[hsl(0_0%_55%)]">
          <p>Para cancelar o modificar tu turno, contactanos directamente:</p>
          <p className="mt-1 text-[hsl(0_0%_75%)] font-medium">+54 11 5555-1234</p>
        </div>

        <div className="flex gap-3">
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Inicio
            </Button>
          </Link>
          <Link href="/reserva" className="flex-1">
            <Button className="w-full">Nueva reserva</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
