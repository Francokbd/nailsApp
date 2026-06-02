/**
 * In-memory store for development/demo.
 * In production, replace with Supabase client calls.
 * Data resets on server restart — intentional for MVP demo.
 */
import {
  MOCK_APPOINTMENTS,
  MOCK_BARBERS,
  MOCK_SERVICES,
  MOCK_BARBERSHOP,
} from '@/data/mock'
import type { Appointment, Barber, Service, Barbershop, AppointmentStatus } from '@/types'
import { generateId } from '@/lib/utils'

// Mutable in-memory collections
let appointments: Appointment[] = [...MOCK_APPOINTMENTS]
const barbers: Barber[] = [...MOCK_BARBERS]
let services: Service[] = [...MOCK_SERVICES]
const barbershop: Barbershop = { ...MOCK_BARBERSHOP }

// --- Appointments ---
export function getAppointments(): Appointment[] {
  return appointments.sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )
}

export function getAppointmentById(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id)
}

export function createAppointment(input: {
  barber_id: string
  service_id: string
  client_name: string
  client_phone: string
  scheduled_at: string
}): Appointment {
  const barber = barbers.find((b) => b.id === input.barber_id)
  const service = services.find((s) => s.id === input.service_id)

  if (!barber || !service) throw new Error('Barber or service not found')

  const appointment: Appointment = {
    id: 'apt_' + generateId(),
    barbershop_id: barbershop.id,
    barber_id: input.barber_id,
    barber,
    service_id: input.service_id,
    service,
    client_name: input.client_name.trim(),
    client_phone: input.client_phone.trim(),
    scheduled_at: input.scheduled_at,
    duration_minutes: service.duration_minutes,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  appointments.push(appointment)
  return appointment
}

export function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Appointment | null {
  const idx = appointments.findIndex((a) => a.id === id)
  if (idx === -1) return null

  appointments[idx] = {
    ...appointments[idx],
    status,
    updated_at: new Date().toISOString(),
  }
  return appointments[idx]
}

export function getOccupiedSlots(barberId: string, date: string): string[] {
  const targetDate = new Date(date).toDateString()
  return appointments
    .filter((a) => {
      if (a.barber_id !== barberId) return false
      if (a.status === 'cancelled') return false
      return new Date(a.scheduled_at).toDateString() === targetDate
    })
    .map((a) => {
      const d = new Date(a.scheduled_at)
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    })
}

// --- Barbers ---
export function getBarbers(): Barber[] {
  return barbers.filter((b) => b.is_active)
}

// --- Services ---
export function getServices(): Service[] {
  return services.filter((s) => s.is_active)
}

export function createService(input: Omit<Service, 'id' | 'barbershop_id' | 'created_at'>): Service {
  const service: Service = {
    ...input,
    id: 'svc_' + generateId(),
    barbershop_id: barbershop.id,
    created_at: new Date().toISOString(),
  }
  services.push(service)
  return service
}

export function updateService(id: string, input: Partial<Service>): Service | null {
  const idx = services.findIndex((s) => s.id === id)
  if (idx === -1) return null
  services[idx] = { ...services[idx], ...input }
  return services[idx]
}

export function deleteService(id: string): boolean {
  const idx = services.findIndex((s) => s.id === id)
  if (idx === -1) return false
  services[idx] = { ...services[idx], is_active: false }
  return true
}

// --- Barbershop ---
export function getBarbershop(): Barbershop {
  return barbershop
}
