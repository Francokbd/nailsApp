'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Clock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Service } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface ServiceForm {
  name: string
  description: string
  price: string
  duration_minutes: string
  is_active: boolean
}

const emptyForm: ServiceForm = {
  name: '',
  description: '',
  price: '',
  duration_minutes: '30',
  is_active: true,
}

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchServices = () => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => { setServices(data); setLoading(false) })
  }

  useEffect(() => { fetchServices() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setDialogOpen(true)
  }

  const openEdit = (service: Service) => {
    setEditingId(service.id)
    setForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      duration_minutes: String(service.duration_minutes),
      is_active: service.is_active,
    })
    setError('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes),
      is_active: form.is_active,
    }

    const url = editingId ? `/api/services/${editingId}` : '/api/services'
    const method = editingId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setDialogOpen(false)
      fetchServices()
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
    }

    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este servicio?')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    fetchServices()
  }

  const isValid = form.name.length >= 2 && parseFloat(form.price) > 0 && parseInt(form.duration_minutes) > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Servicios</h1>
          <p className="text-sm text-[hsl(0_0%_45%)] mt-1">{services.length} servicios activos</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo servicio
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[hsl(0_0%_8%)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map((service) => (
            <Card key={service.id} className="p-4 hover:border-[hsl(0_0%_18%)] transition-all">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[hsl(0_0%_95%)]">{service.name}</p>
                    {!service.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(0_0%_12%)] text-[hsl(0_0%_40%)] border border-[hsl(0_0%_18%)]">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-[hsl(0_0%_50%)] mt-0.5">{service.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-sm font-bold text-[hsl(340_80%_73%)]">
                      {formatCurrency(service.price)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[hsl(0_0%_45%)]">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} min
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(service)}
                    className="p-2 rounded-lg text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_80%)] hover:bg-[hsl(0_0%_10%)] transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 rounded-lg text-[hsl(0_0%_35%)] hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nombre del servicio</Label>
              <Input
                placeholder="ej. Corte Clásico"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción (opcional)</Label>
              <Input
                placeholder="Breve descripción del servicio"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Precio (ARS)</Label>
                <Input
                  type="number"
                  placeholder="3500"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  min="5"
                  step="5"
                  value={form.duration_minutes}
                  onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.is_active ? 'bg-[hsl(340_80%_70%)]' : 'bg-[hsl(0_0%_20%)]'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_active ? 'left-5' : 'left-1'}`} />
              </button>
              <Label className="cursor-pointer" onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}>
                Servicio activo
              </Label>
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
              <Button onClick={handleSave} disabled={!isValid || saving} className="flex-1">
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear servicio'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
