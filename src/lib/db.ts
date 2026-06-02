/**
 * Unified data layer.
 * - Si NEXT_PUBLIC_SUPABASE_URL está configurado → Supabase (PostgreSQL)
 * - Si no → in-memory store (demo / desarrollo sin DB)
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import * as store from './store'
import type { Appointment, Barber, Service, Barbershop, AppointmentStatus } from '@/types'

export const hasSupabase = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

let _db: SupabaseClient | null = null

function getDb(): SupabaseClient {
  if (_db) return _db
  _db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Service role para API routes de servidor (bypasa RLS — seguro porque nunca llega al cliente)
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return _db
}

// Obtiene el barbershop_id del primer registro (single-tenant MVP)
let _barbershopId: string | null = null
async function getBarbershopId(): Promise<string> {
  if (process.env.NEXT_PUBLIC_BARBERSHOP_ID) return process.env.NEXT_PUBLIC_BARBERSHOP_ID
  if (_barbershopId) return _barbershopId
  const { data } = await getDb().from('barbershops').select('id').limit(1).single()
  _barbershopId = data?.id ?? 'bs_001'
  return _barbershopId!
}

// ─── Appointments ───────────────────────────────────────────────

export async function getAppointments(filters?: {
  barber_id?: string
  date?: string
}): Promise<Appointment[]> {
  if (!hasSupabase) {
    let apts = store.getAppointments()
    if (filters?.barber_id) apts = apts.filter((a) => a.barber_id === filters.barber_id)
    if (filters?.date) {
      const target = new Date(filters.date).toDateString()
      apts = apts.filter((a) => new Date(a.scheduled_at).toDateString() === target)
    }
    return apts
  }

  const db = getDb()
  let query = db
    .from('appointments')
    .select('*, barber:barbers(*), service:services(*)')
    .order('scheduled_at', { ascending: true })

  if (filters?.barber_id) query = query.eq('barber_id', filters.barber_id)
  if (filters?.date) {
    const d = new Date(filters.date)
    const start = new Date(d); start.setHours(0, 0, 0, 0)
    const end = new Date(d); end.setHours(23, 59, 59, 999)
    query = query.gte('scheduled_at', start.toISOString()).lte('scheduled_at', end.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as Appointment[]
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  if (!hasSupabase) return store.getAppointmentById(id) ?? null

  const { data, error } = await getDb()
    .from('appointments')
    .select('*, barber:barbers(*), service:services(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as Appointment
}

export async function createAppointment(input: {
  barber_id: string
  service_id: string
  client_name: string
  client_phone: string
  scheduled_at: string
}): Promise<Appointment> {
  if (!hasSupabase) return store.createAppointment(input)

  const db = getDb()

  // Obtener duración y barbershop_id del servicio
  const { data: service } = await db
    .from('services')
    .select('duration_minutes, barbershop_id')
    .eq('id', input.service_id)
    .single()

  if (!service) throw new Error('Servicio no encontrado')

  const { data, error } = await db
    .from('appointments')
    .insert({
      ...input,
      barbershop_id: service.barbershop_id,
      duration_minutes: service.duration_minutes,
      status: 'pending',
    })
    .select('*, barber:barbers(*), service:services(*)')
    .single()

  if (error) throw error
  return data as unknown as Appointment
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment | null> {
  if (!hasSupabase) return store.updateAppointmentStatus(id, status)

  const { data, error } = await getDb()
    .from('appointments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, barber:barbers(*), service:services(*)')
    .single()

  if (error) return null
  return data as unknown as Appointment
}

export async function getOccupiedSlots(barberId: string, date: string): Promise<string[]> {
  if (!hasSupabase) return store.getOccupiedSlots(barberId, date)

  const d = new Date(date)
  const start = new Date(d); start.setHours(0, 0, 0, 0)
  const end = new Date(d); end.setHours(23, 59, 59, 999)

  const { data } = await getDb()
    .from('appointments')
    .select('scheduled_at')
    .eq('barber_id', barberId)
    .neq('status', 'cancelled')
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())

  return (data ?? []).map((a: { scheduled_at: string }) => {
    const dt = new Date(a.scheduled_at)
    return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  })
}

// ─── Barbers ────────────────────────────────────────────────────

export async function getBarbers(): Promise<Barber[]> {
  if (!hasSupabase) return store.getBarbers()

  const { data, error } = await getDb()
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Barber[]
}

// ─── Services ───────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  if (!hasSupabase) return store.getServices()

  const { data, error } = await getDb()
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Service[]
}

export async function createService(
  input: Omit<Service, 'id' | 'barbershop_id' | 'created_at'>
): Promise<Service> {
  if (!hasSupabase) return store.createService(input)

  const barbershop_id = await getBarbershopId()

  const { data, error } = await getDb()
    .from('services')
    .insert({ ...input, barbershop_id })
    .select('*')
    .single()

  if (error) throw error
  return data as Service
}

export async function updateService(id: string, input: Partial<Service>): Promise<Service | null> {
  if (!hasSupabase) return store.updateService(id, input)

  const { data, error } = await getDb()
    .from('services')
    .update(input)
    .eq('id', id)
    .select('*')
    .single()

  if (error) return null
  return data as Service
}

export async function deleteService(id: string): Promise<boolean> {
  if (!hasSupabase) return store.deleteService(id)

  const { error } = await getDb()
    .from('services')
    .update({ is_active: false })
    .eq('id', id)

  return !error
}

// ─── Barbershop ─────────────────────────────────────────────────

export async function getBarbershop(): Promise<Barbershop> {
  if (!hasSupabase) return store.getBarbershop()

  const { data, error } = await getDb()
    .from('barbershops')
    .select('*')
    .limit(1)
    .single()

  if (error) return store.getBarbershop() // fallback a mock si falla
  return data as Barbershop
}
