import type { Barbershop, Barber, Service, Appointment } from '@/types'

export const MOCK_BARBERSHOP: Barbershop = {
  id: 'bs_001',
  name: 'Nail Studio',
  description: 'Uñas perfectas con técnica profesional. El lugar donde el detalle importa.',
  address: 'Av. Santa Fe 2345, Buenos Aires',
  phone: '+54 11 5555-1234',
  created_at: '2024-01-01T00:00:00Z',
}

export const MOCK_BARBERS: Barber[] = [
  {
    id: 'bar_001',
    barbershop_id: 'bs_001',
    name: 'Valentina Méndez',
    bio: 'Especialista en nail art y diseños complejos. 6 años de experiencia.',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=valentina&backgroundColor=ffcce7',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bar_002',
    barbershop_id: 'bs_001',
    name: 'Camila Torres',
    bio: 'Manicura clásica y gel. Amante del minimalismo y las tendencias actuales.',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=camila&backgroundColor=f0c4de',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bar_003',
    barbershop_id: 'bs_001',
    name: 'Sofía Romero',
    bio: 'Especialista en acrílico y extensiones. Técnica certificada internacionalmente.',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia&backgroundColor=e8b4d0',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
]

export const MOCK_SERVICES: Service[] = [
  {
    id: 'svc_001',
    barbershop_id: 'bs_001',
    name: 'Manicura Clásica',
    description: 'Limado, cutícula y esmalte tradicional. Acabado impecable.',
    price: 3000,
    duration_minutes: 30,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'svc_002',
    barbershop_id: 'bs_001',
    name: 'Manicura Gel',
    description: 'Esmalte semipermanente de larga duración. Brillo intenso hasta 3 semanas.',
    price: 4500,
    duration_minutes: 45,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'svc_003',
    barbershop_id: 'bs_001',
    name: 'Pedicura Clásica',
    description: 'Tratamiento completo de pies. Corte, limado y esmalte a elección.',
    price: 3500,
    duration_minutes: 40,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'svc_004',
    barbershop_id: 'bs_001',
    name: 'Uñas Acrílicas',
    description: 'Extensiones acrílicas con forma a elección. Resistencia y durabilidad total.',
    price: 7000,
    duration_minutes: 60,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'svc_005',
    barbershop_id: 'bs_001',
    name: 'Nail Art Premium',
    description: 'Diseño personalizado con técnicas avanzadas. Desde flores hasta geometría.',
    price: 9000,
    duration_minutes: 75,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },
]

function getTodayAt(hour: number, minute: number = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function getTomorrowAt(hour: number, minute: number = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_001',
    barbershop_id: 'bs_001',
    barber_id: 'bar_001',
    barber: MOCK_BARBERS[0],
    service_id: 'svc_001',
    service: MOCK_SERVICES[0],
    client_name: 'Laura Gómez',
    client_phone: '+54 11 4444-1111',
    scheduled_at: getTodayAt(9, 0),
    duration_minutes: 30,
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt_002',
    barbershop_id: 'bs_001',
    barber_id: 'bar_001',
    barber: MOCK_BARBERS[0],
    service_id: 'svc_002',
    service: MOCK_SERVICES[1],
    client_name: 'Florencia Paz',
    client_phone: '+54 11 4444-2222',
    scheduled_at: getTodayAt(10, 0),
    duration_minutes: 45,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt_003',
    barbershop_id: 'bs_001',
    barber_id: 'bar_002',
    barber: MOCK_BARBERS[1],
    service_id: 'svc_004',
    service: MOCK_SERVICES[3],
    client_name: 'Daniela Ruiz',
    client_phone: '+54 11 4444-3333',
    scheduled_at: getTodayAt(10, 30),
    duration_minutes: 60,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt_004',
    barbershop_id: 'bs_001',
    barber_id: 'bar_003',
    barber: MOCK_BARBERS[2],
    service_id: 'svc_005',
    service: MOCK_SERVICES[4],
    client_name: 'Natalia Vega',
    client_phone: '+54 11 4444-4444',
    scheduled_at: getTodayAt(11, 30),
    duration_minutes: 75,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt_005',
    barbershop_id: 'bs_001',
    barber_id: 'bar_001',
    barber: MOCK_BARBERS[0],
    service_id: 'svc_003',
    service: MOCK_SERVICES[2],
    client_name: 'Agustina López',
    client_phone: '+54 11 4444-5555',
    scheduled_at: getTodayAt(12, 0),
    duration_minutes: 40,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt_006',
    barbershop_id: 'bs_001',
    barber_id: 'bar_002',
    barber: MOCK_BARBERS[1],
    service_id: 'svc_001',
    service: MOCK_SERVICES[0],
    client_name: 'Martina Díaz',
    client_phone: '+54 11 4444-6666',
    scheduled_at: getTomorrowAt(9, 30),
    duration_minutes: 30,
    status: 'confirmed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'apt_007',
    barbershop_id: 'bs_001',
    barber_id: 'bar_003',
    barber: MOCK_BARBERS[2],
    service_id: 'svc_002',
    service: MOCK_SERVICES[1],
    client_name: 'Julieta Mora',
    client_phone: '+54 11 4444-7777',
    scheduled_at: getTomorrowAt(11, 0),
    duration_minutes: 45,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const ADMIN_PIN = '1234'
