-- ============================================
-- Nail Studio — Database Schema v1
-- Compatible with Supabase (PostgreSQL)
-- Nota: las tablas usan nombres genéricos (barbershops, barbers)
-- para máxima reutilización del código. El dominio (salón de uñas)
-- solo cambia en los datos seed y en la UI.
-- ============================================

-- Salones (multi-tenant ready)
create table if not exists barbershops (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  address     text default '',
  phone       text default '',
  logo_url    text,
  created_at  timestamptz default now()
);

-- Técnicas de uñas (tabla "barbers" reutilizada)
create table if not exists barbers (
  id             uuid primary key default gen_random_uuid(),
  barbershop_id  uuid not null references barbershops(id) on delete cascade,
  name           text not null,
  bio            text default '',
  photo_url      text,
  is_active      boolean default true,
  created_at     timestamptz default now()
);

-- Servicios
create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  barbershop_id    uuid not null references barbershops(id) on delete cascade,
  name             text not null,
  description      text default '',
  price            numeric(10,2) not null check (price >= 0),
  duration_minutes int not null check (duration_minutes > 0),
  is_active        boolean default true,
  created_at       timestamptz default now()
);

-- Turnos
create table if not exists appointments (
  id               uuid primary key default gen_random_uuid(),
  barbershop_id    uuid not null references barbershops(id) on delete cascade,
  barber_id        uuid not null references barbers(id) on delete cascade,
  service_id       uuid not null references services(id) on delete cascade,
  client_name      text not null,
  client_phone     text not null,
  scheduled_at     timestamptz not null,
  duration_minutes int not null,
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','completed','cancelled')),
  notes            text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ============================================
-- Perfiles de usuario (roles: owner | barber)
-- ============================================
create table if not exists profiles (
  id             uuid primary key references auth.users on delete cascade,
  barbershop_id  uuid not null references barbershops(id) on delete cascade,
  role           text not null check (role in ('owner', 'barber')),
  barber_id      uuid references barbers(id) on delete set null,
  created_at     timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger appointments_updated_at
  before update on appointments
  for each row execute function update_updated_at();

-- Indexes
create index if not exists idx_appointments_barber_date
  on appointments (barber_id, scheduled_at);
create index if not exists idx_appointments_status
  on appointments (status);
create index if not exists idx_appointments_scheduled_at
  on appointments (scheduled_at);
create index if not exists idx_profiles_role
  on profiles (role);

-- ============================================
-- Row Level Security
-- ============================================
alter table barbershops  enable row level security;
alter table barbers       enable row level security;
alter table services      enable row level security;
alter table appointments  enable row level security;
alter table profiles      enable row level security;

-- Público: leer datos para la página de reserva
create policy "public read barbershops" on barbershops for select using (true);
create policy "public read barbers"     on barbers     for select using (true);
create policy "public read services"    on services    for select using (true);

-- Público: crear turnos (flujo de reserva sin auth)
create policy "public create appointments" on appointments for insert with check (true);
create policy "public read appointments"   on appointments for select using (true);

-- Autenticado: actualizar estado de turnos
create policy "auth update appointments" on appointments
  for update using (auth.uid() is not null);

-- Perfiles: cada usuario ve solo el suyo
create policy "own profile" on profiles
  for all using (auth.uid() = id);

-- ============================================
-- SEED: Crear tu primer salón + dueño
-- ============================================
-- Ejecutar DESPUÉS de crear la cuenta del dueño en el Auth dashboard de Supabase
-- Reemplazá los UUIDs con los valores reales

-- Paso 1: Crear el salón
-- insert into barbershops (id, name, description, address, phone)
-- values (
--   'a0000000-0000-0000-0000-000000000001',
--   'Nail Studio',
--   'Uñas perfectas con técnica profesional.',
--   'Av. Santa Fe 2345, Buenos Aires',
--   '+54 11 5555-1234'
-- );

-- Paso 2: Crear perfil del dueño (reemplazá AUTH_USER_ID con el UUID de Supabase Auth)
-- insert into profiles (id, barbershop_id, role, barber_id)
-- values (
--   'AUTH_USER_ID_HERE',
--   'a0000000-0000-0000-0000-000000000001',
--   'owner',
--   null
-- );

-- Paso 3 (opcional): Cargar técnicas iniciales
-- insert into barbers (barbershop_id, name, bio) values
--   ('a0000000-0000-0000-0000-000000000001', 'Valentina Méndez', 'Especialista en nail art'),
--   ('a0000000-0000-0000-0000-000000000001', 'Camila Torres', 'Manicura clásica y gel'),
--   ('a0000000-0000-0000-0000-000000000001', 'Sofía Romero', 'Acrílico y extensiones');

-- Paso 4 (opcional): Cargar servicios iniciales
-- insert into services (barbershop_id, name, description, price, duration_minutes) values
--   ('a0000000-0000-0000-0000-000000000001', 'Manicura Clásica', 'Limado, cutícula y esmalte', 3000, 30),
--   ('a0000000-0000-0000-0000-000000000001', 'Manicura Gel', 'Esmalte semipermanente', 4500, 45),
--   ('a0000000-0000-0000-0000-000000000001', 'Pedicura Clásica', 'Tratamiento completo de pies', 3500, 40),
--   ('a0000000-0000-0000-0000-000000000001', 'Uñas Acrílicas', 'Extensiones con forma a elección', 7000, 60),
--   ('a0000000-0000-0000-0000-000000000001', 'Nail Art Premium', 'Diseño personalizado avanzado', 9000, 75);
