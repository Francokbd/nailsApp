'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

  const handleDemoLogin = (role: 'owner' | 'barber') => {
    localStorage.setItem('admin_auth', 'true')
    localStorage.setItem('demo_role', role)
    if (role === 'owner') router.push('/admin/dashboard')
    else router.push('/barber/dashboard')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isDemoMode) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'barber') router.push('/barber/dashboard')
    else router.push('/admin/dashboard')

    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[hsl(0_0%_3.9%)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(340_80%_70%)] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-bold">Nail Studio</h1>
          <p className="text-sm text-[hsl(0_0%_45%)] mt-1">
            {isDemoMode ? 'Modo demo' : 'Iniciar sesión'}
          </p>
        </div>

        <div className="bg-[hsl(0_0%_6%)] border border-[hsl(0_0%_14%)] rounded-2xl p-6">
          {isDemoMode ? (
            <div className="space-y-3">
              <p className="text-xs text-[hsl(0_0%_45%)] text-center mb-4">
                Supabase no configurado — modo demo
              </p>
              <Button onClick={() => handleDemoLogin('owner')} className="w-full">
                Entrar como Dueño
              </Button>
              <Button onClick={() => handleDemoLogin('barber')} variant="secondary" className="w-full">
                Entrar como Técnica (demo)
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_40%)]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="dueño@nailstudio.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_40%)]" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_70%)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!email || !password || loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
