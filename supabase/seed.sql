-- ============================================
-- Seed inicial — The Cut Studio
-- Ejecutar en Supabase SQL Editor
-- DESPUÉS de crear la cuenta del owner en Auth
-- ============================================

-- 1. Barbería
insert into barbershops (id, name, description, address, phone) values (
  'a0000000-0000-0000-0000-000000000001',
  'The Cut Studio',
  'Cortes modernos con técnica clásica. El mejor ambiente para verte y sentirte bien.',
  'Av. Corrientes 1234, Buenos Aires',
  '+54 11 5555-0000'
) on conflict (id) do nothing;

-- 2. Barberos
insert into barbers (id, barbershop_id, name, bio, photo_url, is_active) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Martín García', 'Especialista en fade y cortes modernos. 8 años de experiencia.',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=martin&backgroundColor=b6e3f4', true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Lucas Romero', 'Maestro del corte tradicional y diseño de barba.',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas&backgroundColor=c0aede', true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Diego Torres', 'Cortes texturizados y degradados con tendencias internacionales.',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=diego&backgroundColor=d1d4f9', true)
on conflict (id) do nothing;

-- 3. Servicios
insert into services (id, barbershop_id, name, description, price, duration_minutes, is_active) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Corte Clásico', 'Corte a tijera o máquina. Incluye lavado y peinado.', 3500, 30, true),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Fade + Diseño', 'Degradado moderno con diseño personalizado. Alta precisión.', 5000, 45, true),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Barba Completa', 'Perfilado, recorte y arreglo de barba con navaja caliente.', 2500, 30, true),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Corte + Barba', 'El combo completo. Corte clásico + arreglo de barba.', 6500, 60, true),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Fade Premium', 'Fade completo con diseño, cejas y limpieza de cuello con navaja.', 7000, 60, true)
on conflict (id) do nothing;

-- 4. Profile del owner
-- Reemplazá 'OWNER_AUTH_UUID' con el UUID del usuario creado en Authentication → Users
-- insert into profiles (id, barbershop_id, role, barber_id) values (
--   'OWNER_AUTH_UUID',
--   'a0000000-0000-0000-0000-000000000001',
--   'owner',
--   null
-- );

-- ============================================
-- (Opcional) Variables de entorno sugeridas
-- NEXT_PUBLIC_BARBERSHOP_ID = a0000000-0000-0000-0000-000000000001
-- ============================================
