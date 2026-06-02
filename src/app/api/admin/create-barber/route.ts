import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { generateId } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(200).optional().default(''),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, bio, email, password } = schema.parse(body)

    // Verify the caller is an authenticated owner
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, barbershop_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      return NextResponse.json({ error: 'Solo el dueño puede crear barberos' }, { status: 403 })
    }

    // Use service role to create the new user
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create Supabase auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
    })

    if (createError || !newUser.user) {
      return NextResponse.json(
        { error: createError?.message || 'Error al crear usuario' },
        { status: 400 }
      )
    }

    // 2. Create barber record
    const barberId = 'bar_' + generateId()
    const { error: barberError } = await adminClient
      .from('barbers')
      .insert({
        id: barberId,
        barbershop_id: profile.barbershop_id,
        name,
        bio,
        photo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(' ', '')}`,
        is_active: true,
      })

    if (barberError) {
      // Rollback: delete auth user
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: 'Error al crear perfil de barbero' }, { status: 500 })
    }

    // 3. Create profile linking auth user → barber → barbershop
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: newUser.user.id,
        barbershop_id: profile.barbershop_id,
        role: 'barber',
        barber_id: barberId,
      })

    if (profileError) {
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: 'Error al crear perfil' }, { status: 500 })
    }

    return NextResponse.json({ success: true, barber_id: barberId }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
