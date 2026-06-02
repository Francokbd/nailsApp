import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // If Supabase is not configured, skip auth (demo mode)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not add logic between createServerClient and getUser
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Protected routes
  const isAdminDashboard = path.startsWith('/admin/dashboard')
  const isBarberDashboard = path.startsWith('/barber')

  if (isAdminDashboard || isBarberDashboard) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Get role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, barber_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // User exists in auth but has no profile → invalid state
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Role enforcement
    if (isAdminDashboard && profile.role !== 'owner') {
      return NextResponse.redirect(new URL('/barber/dashboard', request.url))
    }

    if (isBarberDashboard && profile.role !== 'barber') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Pass role + barber_id to headers so components can read them cheaply
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-role', profile.role)
    requestHeaders.set('x-user-id', user.id)
    if (profile.barber_id) requestHeaders.set('x-barber-id', profile.barber_id)

    supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Redirect /admin → /admin/login or /admin/dashboard based on auth state
  if (path === '/admin') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const dest = profile?.role === 'barber' ? '/barber/dashboard' : '/admin/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin',
    '/admin/dashboard/:path*',
    '/barber/:path*',
  ],
}
