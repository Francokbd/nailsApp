'use client'

import { useEffect, useState } from 'react'
import { Plus, User, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Barber } from '@/types'

interface BarberForm {
  name: string
  bio: string
  email: string
  password: string
}

const emptyForm: BarberForm = { name: '', bio: '', email: '', password: '' }

export default function TecnicasPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<BarberForm>(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL

  useEffect(() => {
    fetch('/api/barbers')
      .then((r) => r.json())
      .then(setBarbers)
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    if (isDemoMode) {
      setTimeout(() => {
        setSaving(false)
        setSuccess(`Cuenta demo creada para ${form.name}. Conectá Supabase para cuentas reales.`)
        setForm(emptyForm)
        setDialogOpen(false)
      }, 800)
      return
    }

    const res = await fetch('/api/admin/create-barber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al crear la cuenta')
      setSaving(false)
      return
    }

    setSuccess(`Cuenta creada para ${form.name}. Ya puede entrar con su email.`)
    setForm(emptyForm)
    setDialogOpen(false)
    setSaving(false)

    fetch('/api/barbers').then((r) => r.json()).then(setBarbers)
  }

  const isValid = form.name.length >= 2 && form.email.includes('@') && form.password.length >= 6

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Técnicas</h1>
          <p className="text-sm text-[hsl(0_0%_45%)] mt-1">
            Gestioná el equipo y sus accesos
          </p>
        </div>
        <Button onClick={() => { setDialogOpen(true); setError(''); setSuccess('') }} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar técnica
        </Button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 text-sm text-green-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {isDemoMode && (
        <div className="p-4 rounded-xl bg-[hsl(340_80%_70%/0.08)] border border-[hsl(340_80%_70%/0.2)] text-sm text-[hsl(340_80%_76%)]">
          <p className="font-medium mb-1">Modo demo — Supabase no configurado</p>
          <p className="text-[hsl(0_0%_50%)]">
            Para crear cuentas reales con email y contraseña, configurá las variables de entorno de Supabase.
            Ver instrucciones en el README.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {barbers.map((barber) => (
          <Card key={barber.id} className="p-4 hover:border-[hsl(0_0%_18%)] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[hsl(340_80%_70%/0.2)] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={barber.photo_url} alt={barber.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[hsl(0_0%_95%)]">{barber.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${barber.is_active ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-[hsl(0_0%_18%)] text-[hsl(0_0%_40%)]'}`}>
                    {barber.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <p className="text-sm text-[hsl(0_0%_50%)] mt-0.5 truncate">{barber.bio}</p>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs text-[hsl(0_0%_40%)]">
                <User className="w-3.5 h-3.5" />
                <span>Técnica</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar técnica</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-[hsl(0_0%_50%)] -mt-2">
            Se crea su perfil y su acceso al panel de técnica.
          </p>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input
                placeholder="Valentina Méndez"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Bio (opcional)</Label>
              <Input
                placeholder="Especialista en nail art y diseños complejos."
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>

            <div className="border-t border-[hsl(0_0%_12%)] pt-4">
              <p className="text-xs text-[hsl(0_0%_45%)] mb-3">
                Credenciales de acceso — la técnica las usará para iniciar sesión
              </p>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_40%)]" />
                    <Input
                      type="email"
                      placeholder="tecnica@email.com"
                      className="pl-10"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Contraseña temporal</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(0_0%_40%)]" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 pr-10"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!isValid || saving} className="flex-1">
                {saving ? 'Creando...' : 'Crear cuenta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
