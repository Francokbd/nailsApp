import { NextResponse } from 'next/server'
import { getOccupiedSlots } from '@/lib/db'
import { generateTimeSlots } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const barberId = searchParams.get('barber_id')
  const date = searchParams.get('date')

  if (!barberId || !date) {
    return NextResponse.json({ error: 'barber_id and date are required' }, { status: 400 })
  }

  const allSlots = generateTimeSlots(9, 20, 30)
  const occupied = await getOccupiedSlots(barberId, date)

  const now = new Date()
  const targetDate = new Date(date)
  const isToday = now.toDateString() === targetDate.toDateString()

  const slots = allSlots.map((time) => {
    const [h, m] = time.split(':').map(Number)
    let available = !occupied.includes(time)

    if (isToday && available) {
      const slotTime = new Date(targetDate)
      slotTime.setHours(h, m, 0, 0)
      available = slotTime > now
    }

    return { time, available }
  })

  return NextResponse.json(slots)
}
