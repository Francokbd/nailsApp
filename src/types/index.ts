export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Barbershop {
  id: string
  name: string
  description: string
  address: string
  phone: string
  logo_url?: string
  created_at: string
}

export interface Barber {
  id: string
  barbershop_id: string
  name: string
  bio: string
  photo_url?: string
  is_active: boolean
  created_at: string
}

export interface Service {
  id: string
  barbershop_id: string
  name: string
  description: string
  price: number
  duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface Appointment {
  id: string
  barbershop_id: string
  barber_id: string
  barber?: Barber
  service_id: string
  service?: Service
  client_name: string
  client_phone: string
  scheduled_at: string
  duration_minutes: number
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateAppointmentInput {
  barber_id: string
  service_id: string
  client_name: string
  client_phone: string
  scheduled_at: string
}

export interface BookingState {
  step: 1 | 2 | 3
  selectedService: Service | null
  selectedBarber: Barber | null
  selectedDate: string | null
  selectedTime: string | null
  clientName: string
  clientPhone: string
}

export interface DaySchedule {
  barber_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  completed: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
}
