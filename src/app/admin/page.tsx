import { redirect } from 'next/navigation'

// The middleware handles redirect logic (to /admin/login or /admin/dashboard)
// If middleware is bypassed (no Supabase), redirect to login
export default function AdminPage() {
  redirect('/admin/login')
}
