import { NextResponse } from 'next/server'
import { updateService, deleteService } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(200).optional(),
  price: z.number().positive().optional(),
  duration_minutes: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = updateSchema.parse(body)
    const service = await updateService(id, data)
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(service)
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await deleteService(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
