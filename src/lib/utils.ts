import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, addMinutes, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "EEEE d 'de' MMMM", { locale: es })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "EEEE d MMM · HH:mm'hs'", { locale: es })
}

export function getEndTime(startTime: string, durationMinutes: number): string {
  const start = parseISO(startTime)
  const end = addMinutes(start, durationMinutes)
  return format(end, 'HH:mm')
}

export function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = []
  let hour = startHour
  let minutes = 0

  while (hour < endHour || (hour === endHour && minutes === 0)) {
    slots.push(`${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    minutes += intervalMinutes
    if (minutes >= 60) {
      hour += Math.floor(minutes / 60)
      minutes = minutes % 60
    }
  }

  return slots
}

export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isSameDay(d, new Date())
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getDayName(date: Date): string {
  return format(date, 'EEEE', { locale: es })
}

export function getWeekDays(referenceDate: Date = new Date()): Date[] {
  const day = referenceDate.getDay()
  const diff = referenceDate.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(referenceDate.setDate(diff))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}
