import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nail Studio — Reserva tu turno',
  description: 'Uñas perfectas con técnica profesional. Reserva tu turno online en segundos.',
  keywords: 'manicura, pedicura, uñas acrílicas, nail art, gel, salón de uñas, reservas online, Buenos Aires',
  openGraph: {
    title: 'Nail Studio',
    description: 'Reserva tu turno en segundos.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[hsl(0_0%_3.9%)] text-[hsl(0_0%_98%)]">
        {children}
      </body>
    </html>
  )
}
