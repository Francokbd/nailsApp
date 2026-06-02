import { NextResponse } from 'next/server'
import { getAppointmentById, updateAppointmentStatus } from '@/lib/db'
import { z } from 'zod'
import type { AppointmentStatus } from '@/types'

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
})

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const appointment = await getAppointmentById(id)
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(appointment)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = statusSchema.parse(body)
    const updated = await updateAppointmentStatus(id, status as AppointmentStatus)
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
