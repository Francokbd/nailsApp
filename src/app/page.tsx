import Link from 'next/link'
import { Sparkles, Clock, Star, MapPin, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Navbar } from '@/components/shared/navbar'
import { MOCK_SERVICES, MOCK_BARBERS, MOCK_BARBERSHOP } from '@/data/mock'
import { formatCurrency } from '@/lib/utils'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_3.9%)]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[hsl(340_80%_70%/0.06)] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[hsl(340_80%_70%/0.3)] bg-[hsl(340_80%_70%/0.08)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(340_80%_70%)] animate-pulse" />
            <span className="text-xs text-[hsl(340_80%_76%)] font-medium">Reservas online disponibles</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6">
            Tus uñas,<br />
            <span className="text-gradient">a tu manera.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[hsl(0_0%_55%)] max-w-xl mx-auto mb-10">
            Reservá tu turno en segundos. Sin llamadas, sin espera.
            Solo elegís técnica, horario y listo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reserva">
              <Button size="xl" className="gap-2 w-full sm:w-auto">
                Reservar turno
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#servicios">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                Ver servicios
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-14 text-sm text-[hsl(0_0%_45%)]">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[hsl(340_80%_70%)] fill-[hsl(340_80%_70%)]" />
              <span>4.9 · 200+ reseñas</span>
            </div>
            <div className="w-px h-4 bg-[hsl(0_0%_18%)] hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[hsl(340_80%_70%)]" />
              <span>+2000 manicuras realizadas</span>
            </div>
            <div className="w-px h-4 bg-[hsl(0_0%_18%)] hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[hsl(340_80%_70%)]" />
              <span>Lun–Sáb · 9–20hs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Nuestros servicios</h2>
            <p className="text-[hsl(0_0%_50%)]">Todo lo que necesitás, al precio justo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_SERVICES.map((service) => (
              <Card
                key={service.id}
                className="p-5 hover:border-[hsl(340_80%_70%/0.4)] hover:bg-[hsl(0_0%_7%)] transition-all group cursor-default"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[hsl(340_80%_70%/0.12)] flex items-center justify-center group-hover:bg-[hsl(340_80%_70%/0.2)] transition-colors">
                    <Sparkles className="w-4 h-4 text-[hsl(340_80%_70%)]" />
                  </div>
                  <span className="text-xl font-bold text-[hsl(340_80%_73%)]">
                    {formatCurrency(service.price)}
                  </span>
                </div>

                <h3 className="font-semibold text-[hsl(0_0%_95%)] mb-1">{service.name}</h3>
                <p className="text-sm text-[hsl(0_0%_50%)] mb-3 leading-relaxed">{service.description}</p>

                <div className="flex items-center gap-1.5 text-xs text-[hsl(0_0%_45%)]">
                  <Clock className="w-3 h-3" />
                  <span>{service.duration_minutes} min</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/reserva">
              <Button size="lg" className="gap-2">
                Reservar ahora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 border-t border-[hsl(0_0%_10%)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Nuestro equipo</h2>
            <p className="text-[hsl(0_0%_50%)]">Técnicas apasionadas por su trabajo.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {MOCK_BARBERS.map((barber) => (
              <Card key={barber.id} className="p-6 text-center hover:border-[hsl(0_0%_20%)] transition-all">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-[hsl(340_80%_70%/0.3)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={barber.photo_url} alt={barber.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-[hsl(0_0%_95%)] mb-1">{barber.name}</h3>
                <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed">{barber.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 border-t border-[hsl(0_0%_10%)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Tan simple como 1, 2, 3</h2>
            <p className="text-[hsl(0_0%_50%)]">Sin crear cuenta. Sin complicaciones.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Elegís el servicio', desc: 'Seleccioná la manicura que querés y tu técnica preferida.' },
              { step: '02', title: 'Elegís el horario', desc: 'Ves los turnos disponibles y elegís el que más te conviene.' },
              { step: '03', title: 'Confirmás el turno', desc: 'Solo tu nombre y teléfono. Confirmación al instante.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[hsl(340_80%_70%/0.1)] border border-[hsl(340_80%_70%/0.2)] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[hsl(340_80%_73%)] font-bold text-sm">{item.step}</span>
                </div>
                <h3 className="font-semibold text-[hsl(0_0%_95%)] mb-2">{item.title}</h3>
                <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl border border-[hsl(340_80%_70%/0.3)] bg-[hsl(340_80%_70%/0.05)] p-8 sm:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(340_80%_70%/0.05)] to-transparent pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 relative">¿Lista para lucir perfecta?</h2>
            <p className="text-[hsl(0_0%_55%)] mb-6 relative">Reservá tu turno ahora y llegá directo al salón.</p>
            <Link href="/reserva">
              <Button size="xl" className="gap-2 relative">
                Reservar mi turno
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(0_0%_10%)] py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[hsl(340_80%_70%)] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="font-bold text-sm">{MOCK_BARBERSHOP.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[hsl(0_0%_45%)]">
            <a href={`tel:${MOCK_BARBERSHOP.phone}`} className="flex items-center gap-1.5 hover:text-[hsl(0_0%_80%)] transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {MOCK_BARBERSHOP.phone}
            </a>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {MOCK_BARBERSHOP.address}
            </span>
          </div>

          <Link href="/admin" className="text-xs text-[hsl(0_0%_30%)] hover:text-[hsl(0_0%_50%)] transition-colors">
            Acceso admin
          </Link>
        </div>
      </footer>
    </div>
  )
}
