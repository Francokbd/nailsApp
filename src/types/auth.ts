export type UserRole = 'owner' | 'barber'

export interface Profile {
  id: string
  barbershop_id: string
  role: UserRole
  barber_id: string | null
  created_at: string
}
