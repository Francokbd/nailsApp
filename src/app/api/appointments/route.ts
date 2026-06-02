import { NextResponse } from 'next/server'
import { getAppointments, createAppointment, getOccupiedSlots } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  barber_id: z.string().min(1),
  service_id: z.string().min(1),
  client_name: z.string().min(2).max(80),
  client_phone: z.string().min(6).max(30),
  scheduled_at: z.string().datetime(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? undefined
  const barber_id = searchParams.get('barber_id') ?? undefined

  const appointments = await getAppointments({ barber_id, date })
  return NextResponse.json(appointments)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createSchema.parse(body)

    // Verificar disponibilidad del slot
    const scheduledDate = new Date(data.scheduled_at)
    const time = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(scheduledDate.getMinutes()).padStart(2, '0')}`
    const occupied = await getOccupiedSlots(data.barber_id, data.scheduled_at)

    if (occupied.includes(time)) {
      return NextResponse.json(
        { error: 'El horario seleccionado ya no está disponible' },
        { status: 409 }
      )
    }

    const appointment = await createAppointment(data)
    return NextResponse.json(appointment, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
