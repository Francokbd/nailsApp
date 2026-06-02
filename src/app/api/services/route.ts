import { NextResponse } from 'next/server'
import { getServices, createService } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(200).optional().default(''),
  price: z.number().positive(),
  duration_minutes: z.number().int().positive(),
  is_active: z.boolean().optional().default(true),
})

export async function GET() {
  return NextResponse.json(await getServices())
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = createSchema.parse(body)
    const service = await createService(data)
    return NextResponse.json(service, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
