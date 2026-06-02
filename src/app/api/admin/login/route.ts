import { NextResponse } from 'next/server'
import { z } from 'zod'

const ADMIN_PIN = process.env.ADMIN_PIN || '1234'

const loginSchema = z.object({
  pin: z.string().min(4).max(8),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { pin } = loginSchema.parse(body)

    if (pin !== ADMIN_PIN) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
    }

    return NextResponse.json({ success: true, token: Buffer.from(pin + Date.now()).toString('base64') })
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }
}
