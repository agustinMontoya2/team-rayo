# Migración a Supabase — Plan de Implementación

## Estado Actual

- **Frontend SPA puro** (React 18 + Vite + TypeScript)
- **Auth hardcodeada** en `LoginScreen.tsx`: usuario `profe`, contraseña `rayo2026`
- **Datos en localStorage** (`store.ts`): Context + `useReducer`, serializado bajo key `team_rayo_mvp_v1`
- **Esquema DB diseñado** en `planning/DER.dbml` (12 tablas, 2 enums) pero no implementado
- **Seed data hardcodeado** en la función `seed()` de `store.ts`
- **Una sola usuaria**: el profe (Daniel Portillo). Los alumnos no acceden al sistema

### Entidades actuales en el store

| Entidad | Cantidad seed | Tabla Supabase equivalente |
|---------|--------------|---------------------------|
| `Horario` | 4 | `schedules` |
| `Plan` | 2 | `plans` |
| `Alumno` | 6 | `students` |
| `Graduacion` | 6 | `belt_exams` |
| `Cuota` | 6 | `payments` |
| `Jornada` | 3 | `attendances` (modelado diferente) |
| `Evento` | 3 | `events` + `event_participants` + `fights` |

### Vistas del admin

| Vista | Lee | Escribe | Complejidad migración |
|-------|-----|---------|----------------------|
| `Resumen` | alumnos, cuotas, eventos, jornadas | — | Baja (solo lectura) |
| `Alumnos` (+ FormModal + PerfilDrawer) | alumnos, planes, graduaciones, jornadas, horarios, cuotas, eventos | alumnos (CRUD + pesos) | Alta |
| `Cinturones` | alumnos, graduaciones | graduaciones | Baja |
| `Cuotas` | cuotas, alumnos, planes | cuotas, planes | Media |
| `Asistencia` | alumnos, jornadas, horarios | jornadas | Media |
| `Eventos` | eventos, alumnos | eventos, participantes, peleas | Alta |
| `Competencias` | alumnos, eventos | — | Baja (solo lectura) |
| `Horarios` | horarios, jornadas | horarios, jornadas | Baja |

---

## Arquitectura Objetivo

```
src/
├── lib/
│   ├── supabase.ts                  # Cliente Supabase (createClient)
│   └── query-client.ts              # QueryClient de TanStack Query
│
├── features/admin/
│   ├── types.ts                     # Tipos compartidos (snake_case, 1:1 con tablas)
│   │
│   ├── providers/
│   │   ├── AuthProvider.tsx          # Context de auth (session, user, gymId, login, logout)
│   │   └── QueryProvider.tsx         # QueryClientProvider wrapper
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Hook de autenticación
│   │   ├── useAlumnos.ts            # useQuery + useMutation para students
│   │   ├── usePlanes.ts             # useQuery + useMutation para plans
│   │   ├── usePagos.ts              # useQuery + useMutation para payments
│   │   ├── useGraduaciones.ts       # useQuery + useMutation para belt_exams
│   │   ├── useAsistencia.ts         # useQuery + useMutation para attendances
│   │   ├── useHorarios.ts           # useQuery + useMutation para schedules
│   │   └── useEventos.ts            # useQuery + useMutation para events + participants + fights
│   │
│   ├── services/                    # Capa de abstracción (migrable a API REST/GraphQL)
│   │   ├── alumnos.service.ts       # CRUD students + weight_records
│   │   ├── planes.service.ts        # CRUD plans
│   │   ├── pagos.service.ts         # CRUD payments
│   │   ├── graduaciones.service.ts  # CRUD belt_exams
│   │   ├── asistencia.service.ts    # CRUD attendances
│   │   ├── horarios.service.ts      # CRUD schedules
│   │   ├── eventos.service.ts       # CRUD events + event_participants + fights
│   │   └── index.ts                 # Barrel export
│   │
│   ├── views/                       # Migrados: usan hooks en vez de useStore
│   │   ├── Resumen.tsx
│   │   ├── Alumnos.tsx
│   │   ├── AlumnoFormModal.tsx
│   │   ├── AlumnoPerfilDrawer.tsx
│   │   ├── Cinturones.tsx
│   │   ├── Cuotas.tsx
│   │   ├── Asistencia.tsx
│   │   ├── Eventos.tsx
│   │   ├── Competencias.tsx
│   │   └── Horarios.tsx
│   │
│   ├── AdminLayout.tsx              # Usa useAuth() en vez de useState
│   ├── LoginScreen.tsx              # Llama supabase.auth en vez de comparar strings
│   ├── Sidebar.tsx                  # Sin cambios
│   ├── Topbar.tsx                   # Usa useAuth() para user data
│   ├── Modal.tsx                    # Sin cambios
│   └── ui-kit.tsx                   # Sin cambios
│
├── main.tsx                         # QueryProvider + AuthProvider envuelven rutas admin
│
└── features/landing/                # NO SE TOCA
```

### Principios de diseño

1. **Services = capa de abstracción pura.** Solo los services hablan con Supabase. Si mañana cambias a una API REST, GraphQL, o Firebase, solo reescribes los services. Los hooks y views no cambian.

2. **Hooks = orquestación.** Cada hook combina un service con React Query (`useQuery` / `useMutation`). Maneja cache, re-fetching, invalidación y loading states.

3. **Views = presentación + lógica UI.** Las views llaman hooks, no services directamente. No saben de dónde vienen los datos.

4. **RLS = seguridad en la DB.** Cada fila lleva `gym_id`. El profe solo puede ver/escribir datos de su propio gimnasio. Incluso si el frontend falla, la DB protege los datos.

---

## Fase 1 — Setup de Dependencias y Configuración

### 1.1 Instalar dependencias

```bash
pnpm add @supabase/supabase-js @tanstack/react-query
```

### 1.2 Variables de entorno

Crear `.env` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Agregar `.env` al `.gitignore`.

### 1.3 Crear `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 1.4 Crear `src/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30 segundos antes de considerar stale
      gcTime: 5 * 60_000,          // 5 minutos en memoria
      refetchOnWindowFocus: false,  // No re-fetch al cambiar de pestaña
      retry: 1,                     // Un retry automático en caso de error
    },
  },
})
```

### 1.5 Actualizar `src/main.tsx`

```typescript
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { QueryProvider } from './features/admin/providers/QueryProvider'
import { AuthProvider } from './features/admin/providers/AuthProvider'
import Landing from './features/landing/Landing.tsx'
import { AdminLayout } from './features/admin/AdminLayout.tsx'
import { Resumen } from './features/admin/views/Resumen.tsx'
// ...resto de imports

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Resumen />} />
            {/* ...resto de rutas */}
          </Route>
        </Routes>
      </AuthProvider>
    </QueryProvider>
  </BrowserRouter>
)
```

### 1.6 Crear `src/features/admin/providers/QueryProvider.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## Fase 2 — Esquema de Base de Datos + RLS

### 2.1 Helper function para RLS

Esta función devuelve el `gym_id` del usuario autenticado. Se usa en todas las policies.

```sql
CREATE OR REPLACE FUNCTION get_user_gym_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT gym_id FROM professors WHERE id = auth.uid() LIMIT 1;
$$;
```

**¿Por qué `SECURITY DEFINER`?** La función se ejecuta con los permisos del owner de la DB, no del usuario. Esto permite que las policies lean la tabla `professors` sin que el usuario necesite permiso explícito sobre ella.

### 2.2 Enum types

```sql
CREATE TYPE event_type AS ENUM ('competition', 'exhibition');
CREATE TYPE fight_result AS ENUM ('win', 'loss', 'draw');
```

### 2.3 Tablas

#### `gyms`

```sql
CREATE TABLE gyms (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar NOT NULL,
  slug       varchar NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: solo el profe autenticado puede leer su propio gym
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON gyms
  FOR SELECT USING (id = get_user_gym_id());
```

#### `professors`

```sql
CREATE TABLE professors (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id     uuid NOT NULL REFERENCES gyms(id),
  name       varchar NOT NULL,
  email      varchar NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_professors_gym_id ON professors(gym_id);

ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- El profe solo puede verse a sí mismo
CREATE POLICY "prof_select_self" ON professors
  FOR SELECT USING (id = auth.uid());
```

> **Nota:** No se almacena `password` en la tabla porque la contraseña la maneja Supabase Auth (`auth.users`). El `email` y `password` se registran como usuario en Auth, y el registro en `professors` vincula el `auth.uid()` con el `gym_id`.

#### `categories`

```sql
CREATE TABLE categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     uuid NOT NULL REFERENCES gyms(id),
  name       varchar NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_gym_id ON categories(gym_id);
CREATE UNIQUE INDEX idx_categories_gym_name ON categories(gym_id, name);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON categories FOR SELECT USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_insert_own_gym" ON categories FOR INSERT WITH CHECK (gym_id = get_user_gym_id());
CREATE POLICY "prof_update_own_gym" ON categories FOR UPDATE USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_delete_own_gym" ON categories FOR DELETE USING (gym_id = get_user_gym_id());
```

#### `plans`

```sql
CREATE TABLE plans (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id     uuid NOT NULL REFERENCES gyms(id),
  name       varchar NOT NULL,
  price      decimal NOT NULL,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_plans_gym_id ON plans(gym_id);
CREATE UNIQUE INDEX idx_plans_gym_name ON plans(gym_id, name);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON plans FOR SELECT USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_insert_own_gym" ON plans FOR INSERT WITH CHECK (gym_id = get_user_gym_id());
CREATE POLICY "prof_update_own_gym" ON plans FOR UPDATE USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_delete_own_gym" ON plans FOR DELETE USING (gym_id = get_user_gym_id());
```

#### `students`

```sql
CREATE TABLE students (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id            uuid NOT NULL REFERENCES gyms(id),
  plan_id           uuid NOT NULL REFERENCES plans(id),
  category_id       uuid REFERENCES categories(id),
  first_name        varchar NOT NULL,
  last_name         varchar NOT NULL,
  dni               varchar NOT NULL,
  birth_date        date NOT NULL,
  phone             varchar NOT NULL,
  admission_date    date NOT NULL,
  current_weight    decimal,
  competition_photo varchar,
  active            boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_gym_id ON students(gym_id);
CREATE INDEX idx_students_plan_id ON students(plan_id);
CREATE INDEX idx_students_category_id ON students(category_id);
CREATE UNIQUE INDEX idx_students_gym_dni ON students(gym_id, dni);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON students FOR SELECT USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_insert_own_gym" ON students FOR INSERT WITH CHECK (gym_id = get_user_gym_id());
CREATE POLICY "prof_update_own_gym" ON students FOR UPDATE USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_delete_own_gym" ON students FOR DELETE USING (gym_id = get_user_gym_id());
```

#### `weight_records`

```sql
CREATE TABLE weight_records (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  weight     decimal NOT NULL,
  date       date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_weight_records_student_id ON weight_records(student_id);
CREATE UNIQUE INDEX idx_weight_records_student_date ON weight_records(student_id, date);

ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

-- RLS hereda del padre: si puede ver el student, puede ver sus pesos
CREATE POLICY "prof_select_own_gym" ON weight_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = weight_records.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_insert_own_gym" ON weight_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE students.id = weight_records.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_update_own_gym" ON weight_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = weight_records.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_delete_own_gym" ON weight_records
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = weight_records.student_id AND students.gym_id = get_user_gym_id())
  );
```

#### `payments`

```sql
CREATE TABLE payments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id    uuid NOT NULL REFERENCES plans(id),
  student_id uuid NOT NULL REFERENCES students(id),
  year       int NOT NULL,
  month      int NOT NULL,
  amount     decimal NOT NULL,
  paid_at    timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_plan_id ON payments(plan_id);
CREATE UNIQUE INDEX idx_payments_student_period ON payments(student_id, year, month);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = payments.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_insert_own_gym" ON payments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE students.id = payments.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_delete_own_gym" ON payments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = payments.student_id AND students.gym_id = get_user_gym_id())
  );
```

#### `schedules`

```sql
CREATE TABLE schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      uuid NOT NULL REFERENCES gyms(id),
  name        varchar NOT NULL,
  day_of_week int NOT NULL,           -- 0=domingo, 1=lunes, ..., 6=sabado
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_schedules_gym_id ON schedules(gym_id);
CREATE INDEX idx_schedules_gym_dow ON schedules(gym_id, day_of_week);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON schedules FOR SELECT USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_insert_own_gym" ON schedules FOR INSERT WITH CHECK (gym_id = get_user_gym_id());
CREATE POLICY "prof_update_own_gym" ON schedules FOR UPDATE USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_delete_own_gym" ON schedules FOR DELETE USING (gym_id = get_user_gym_id());
```

#### `attendances`

```sql
CREATE TABLE attendances (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES students(id),
  schedule_id uuid NOT NULL REFERENCES schedules(id),
  date        date NOT NULL,
  present     boolean NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attendances_student_id ON attendances(student_id);
CREATE INDEX idx_attendances_schedule_id ON attendances(schedule_id);
CREATE UNIQUE INDEX idx_attendances_student_sched_date ON attendances(student_id, schedule_id, date);
CREATE INDEX idx_attendances_sched_date ON attendances(schedule_id, date);

ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON attendances
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = attendances.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_insert_own_gym" ON attendances
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE students.id = attendances.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_update_own_gym" ON attendances
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = attendances.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_delete_own_gym" ON attendances
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = attendances.student_id AND students.gym_id = get_user_gym_id())
  );
```

#### `belt_exams`

```sql
CREATE TABLE belt_exams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id),
  belt       varchar NOT NULL,
  score      decimal NOT NULL,
  date       date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_belt_exams_student_id ON belt_exams(student_id);
CREATE UNIQUE INDEX idx_belt_exams_student_date ON belt_exams(student_id, date);

ALTER TABLE belt_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON belt_exams
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = belt_exams.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_insert_own_gym" ON belt_exams
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE students.id = belt_exams.student_id AND students.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_delete_own_gym" ON belt_exams
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = belt_exams.student_id AND students.gym_id = get_user_gym_id())
  );
```

#### `events`

```sql
CREATE TABLE events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id      uuid NOT NULL REFERENCES gyms(id),
  name        varchar NOT NULL,
  type        event_type NOT NULL,
  description text,
  date        date NOT NULL,
  is_public   boolean NOT NULL DEFAULT false,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_gym_id ON events(gym_id);
CREATE INDEX idx_events_gym_date ON events(gym_id, date);
CREATE INDEX idx_events_gym_type ON events(gym_id, type);
CREATE INDEX idx_events_gym_public_date ON events(gym_id, is_public, date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON events FOR SELECT USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_insert_own_gym" ON events FOR INSERT WITH CHECK (gym_id = get_user_gym_id());
CREATE POLICY "prof_update_own_gym" ON events FOR UPDATE USING (gym_id = get_user_gym_id());
CREATE POLICY "prof_delete_own_gym" ON events FOR DELETE USING (gym_id = get_user_gym_id());
```

#### `event_participants`

```sql
CREATE TABLE event_participants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id),
  weight     decimal,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_student_id ON event_participants(student_id);
CREATE UNIQUE INDEX idx_event_participants_event_student ON event_participants(event_id, student_id);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON event_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_participants.event_id AND events.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_insert_own_gym" ON event_participants
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_participants.event_id AND events.gym_id = get_user_gym_id())
  );
CREATE POLICY "prof_delete_own_gym" ON event_participants
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_participants.event_id AND events.gym_id = get_user_gym_id())
  );
```

#### `fights`

```sql
CREATE TABLE fights (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_participant_id  uuid NOT NULL REFERENCES event_participants(id) ON DELETE CASCADE,
  opponent_name         varchar NOT NULL,
  opponent_weight       decimal,
  result                fight_result NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fights_event_participant_id ON fights(event_participant_id);

ALTER TABLE fights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prof_select_own_gym" ON fights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM event_participants ep
      JOIN events e ON e.id = ep.event_id
      WHERE ep.id = fights.event_participant_id AND e.gym_id = get_user_gym_id()
    )
  );
CREATE POLICY "prof_insert_own_gym" ON fights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_participants ep
      JOIN events e ON e.id = ep.event_id
      WHERE ep.id = fights.event_participant_id AND e.gym_id = get_user_gym_id()
    )
  );
CREATE POLICY "prof_update_own_gym" ON fights
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM event_participants ep
      JOIN events e ON e.id = ep.event_id
      WHERE ep.id = fights.event_participant_id AND e.gym_id = get_user_gym_id()
    )
  );
CREATE POLICY "prof_delete_own_gym" ON fights
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM event_participants ep
      JOIN events e ON e.id = ep.event_id
      WHERE ep.id = fights.event_participant_id AND e.gym_id = get_user_gym_id()
    )
  );
```

### 2.4 Seed Data

```sql
-- 1. Gym
INSERT INTO gyms (id, name, slug) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Team Rayo', 'team-rayo');

-- 2. Professor (el id debe coincidir con el auth.users.id creado en Supabase Auth)
-- IMPORTANTE: Crear el usuario en Supabase Auth primero (email/profe@teamrayo.com, password: rayo2026)
-- Luego usar el auth.uid() resultante:
INSERT INTO professors (id, gym_id, name, email) VALUES
  ('AUTH_UID_AQUI', 'a0000000-0000-0000-0000-000000000001', 'Daniel Portillo', 'profe@teamrayo.com');

-- 3. Categories
INSERT INTO categories (id, gym_id, name) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Juvenil'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Adulto'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Master');

-- 4. Plans
INSERT INTO plans (id, gym_id, name, price) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Plan Recreativo', 18000),
  ('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Plan Competitivo', 25000);

-- 5. Students (6 alumnos del seed actual)
-- ... INSERTs con gym_id y plan_id correctos

-- 6. Weight records, graduations, payments, schedules, attendances, events, participants, fights
-- ... todos los datos del seed actual, mapeados a las tablas nuevas
```

---

## Fase 3 — Autenticación

### 3.1 Crear usuario en Supabase Auth

Desde el dashboard de Supabase → Authentication → Users → Add user:
- Email: `profe@teamrayo.com`
- Password: `rayo2026`
- Auto-confirm: Yes

### 3.2 Crear `src/features/admin/hooks/useAuth.ts`

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  gymId: string | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    gymId: null,
    loading: true,
  })

  useEffect(() => {
    // 1. Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // 2. Buscar gym_id en professors
        supabase
          .from('professors')
          .select('gym_id')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setState({
              user: session.user,
              gymId: data?.gym_id ?? null,
              loading: false,
            })
          })
      } else {
        setState({ user: null, gymId: null, loading: false })
      }
    })

    // 3. Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          supabase
            .from('professors')
            .select('gym_id')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              setState({
                user: session.user,
                gymId: data?.gym_id ?? null,
                loading: false,
              })
            })
        } else {
          setState({ user: null, gymId: null, loading: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { ...state, login, logout }
}
```

### 3.3 Crear `src/features/admin/providers/AuthProvider.tsx`

```typescript
import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AuthCtx {
  user: any | null
  gymId: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null,
  gymId: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>
}

export function useAuthContext() {
  return useContext(Ctx)
}
```

### 3.4 Modificar `LoginScreen.tsx`

Reemplazar la auth hardcodeada:

```typescript
// ANTES:
if (usuario === 'profe' && contrasena === 'rayo2026') {
  onLogin();
}

// DESPUÉS:
try {
  await login(usuario, contrasena);
  onLogin();
} catch (e: any) {
  setError(e.message || 'Credenciales incorrectas');
}
```

Cambiar el label de "Usuario" a "Email".

### 3.5 Modificar `AdminLayout.tsx`

```typescript
// ANTES:
const [isLoggedIn, setIsLoggedIn] = useState(false);

// DESPUÉS:
const { user, loading, logout } = useAuthContext();
const isLoggedIn = !!user;
```

El `user` ya no es hardcodeado, viene de Supabase Auth + tabla `professors`.

---

## Fase 4 — Tipos Compartidos

Crear `src/features/admin/types.ts` con tipos que mapean 1:1 a las tablas Supabase (snake_case):

```typescript
export interface Gym {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Professor {
  id: string
  gym_id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  gym_id: string
  name: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Plan {
  id: string
  gym_id: string
  name: string
  price: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  gym_id: string
  plan_id: string
  category_id: string | null
  first_name: string
  last_name: string
  dni: string
  birth_date: string
  phone: string
  admission_date: string
  current_weight: number | null
  competition_photo: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface WeightRecord {
  id: string
  student_id: string
  weight: number
  date: string
  created_at: string
}

export interface Payment {
  id: string
  plan_id: string
  student_id: string
  year: number
  month: number
  amount: number
  paid_at: string
  created_at: string
}

export interface Schedule {
  id: string
  gym_id: string
  name: string
  day_of_week: number
  start_time: string
  end_time: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  student_id: string
  schedule_id: string
  date: string
  present: boolean
  created_at: string
}

export interface BeltExam {
  id: string
  student_id: string
  belt: string
  score: number
  date: string
  created_at: string
}

export interface Event {
  id: string
  gym_id: string
  name: string
  type: 'competition' | 'exhibition'
  description: string | null
  date: string
  is_public: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  student_id: string
  weight: number | null
  created_at: string
}

export interface Fight {
  id: string
  event_participant_id: string
  opponent_name: string
  opponent_weight: number | null
  result: 'win' | 'loss' | 'draw'
  created_at: string
}

// Tipos para joins (lo que devuelven los services con .select())
export interface StudentWithRelations extends Student {
  plans: Pick<Plan, 'name' | 'price'>
  categories: Pick<Category, 'name'> | null
  weight_records: WeightRecord[]
}

export interface EventWithParticipants extends Event {
  event_participants: (EventParticipant & {
    students: Pick<Student, 'first_name' | 'last_name'>
  })[]
  fights: Fight[]
}
```

---

## Fase 5 — Capa de Servicios

### Principios

- Cada service es un archivo con **funciones async puras**
- Importan `supabase` de `@/lib/supabase`
- Hacen `throw` en caso de error (el hook se encarga del manejo)
- Devuelven tipos de `types.ts`
- **No usan hooks de React** — son funciones JavaScript puras
- Para migrar a API: solo cambias el contenido de estas funciones (fetch a tu API en vez de supabase.from)

### `alumnos.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { StudentWithRelations, WeightRecord } from '../types'

export async function fetchAlumnos(): Promise<StudentWithRelations[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*, plans(name, price), categories(name), weight_records(*)')
    .order('last_name')
  if (error) throw error
  return data
}

export async function createAlumno(alumno: Omit<StudentWithRelations, 'id' | 'created_at' | 'updated_at' | 'plans' | 'categories' | 'weight_records'>): Promise<StudentWithRelations> {
  const { data, error } = await supabase
    .from('students')
    .insert(alumno)
    .select('*, plans(name, price), categories(name), weight_records(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateAlumno(id: string, updates: Partial<StudentWithRelations>): Promise<StudentWithRelations> {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select('*, plans(name, price), categories(name), weight_records(*)')
    .single()
  if (error) throw error
  return data
}

export async function addWeightRecord(record: Omit<WeightRecord, 'id' | 'created_at'>): Promise<WeightRecord> {
  const { data, error } = await supabase
    .from('weight_records')
    .upsert(record, { onConflict: 'student_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWeightRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('weight_records')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

### `planes.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { Plan } from '../types'

export async function fetchPlanes(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
  const { data, error } = await supabase
    .from('plans')
    .insert(plan)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlan(id: string, updates: Partial<Plan>): Promise<Plan> {
  const { data, error } = await supabase
    .from('plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
```

### `pagos.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { Payment } from '../types'

export async function fetchPagos(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, students(first_name, last_name), plans(name)')
    .order('paid_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPago(pago: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert(pago)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePago(id: string): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

### `graduaciones.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { BeltExam } from '../types'

export async function fetchGraduaciones(): Promise<BeltExam[]> {
  const { data, error } = await supabase
    .from('belt_exams')
    .select('*, students(first_name, last_name)')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createGraduacion(grad: Omit<BeltExam, 'id' | 'created_at'>): Promise<BeltExam> {
  const { data, error } = await supabase
    .from('belt_exams')
    .insert(grad)
    .select()
    .single()
  if (error) throw error
  return data
}
```

### `asistencia.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { Attendance } from '../types'

export async function fetchAsistencias(): Promise<Attendance[]> {
  const { data, error } = await supabase
    .from('attendances')
    .select('*, students(first_name, last_name), schedules(name, day_of_week, start_time, end_time)')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function upsertAsistencia(records: Omit<Attendance, 'id' | 'created_at'>[]): Promise<void> {
  const { error } = await supabase
    .from('attendances')
    .upsert(records, { onConflict: 'student_id,schedule_id,date' })
  if (error) throw error
}

export async function deleteAsistenciaByDateAndSchedule(date: string, scheduleId: string): Promise<void> {
  const { error } = await supabase
    .from('attendances')
    .delete()
    .eq('date', date)
    .eq('schedule_id', scheduleId)
  if (error) throw error
}
```

### `horarios.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { Schedule } from '../types'

export async function fetchHorarios(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('day_of_week')
  if (error) throw error
  return data
}

export async function createHorario(horario: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>): Promise<Schedule> {
  const { data, error } = await supabase
    .from('schedules')
    .insert(horario)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHorario(id: string, updates: Partial<Schedule>): Promise<Schedule> {
  const { data, error } = await supabase
    .from('schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHorario(id: string): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

### `eventos.service.ts`

```typescript
import { supabase } from '@/lib/supabase'
import type { Event, EventParticipant, Fight } from '../types'

export async function fetchEventos(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, event_participants(*, students(first_name, last_name)), fights(*)')
    .order('date', { ascending: false })
  if (error) throw error
  return data
}

export async function createEvento(evento: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(evento)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateEvento(id: string, updates: Partial<Event>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvento(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function addParticipant(participant: Omit<EventParticipant, 'id' | 'created_at'>): Promise<EventParticipant> {
  const { data, error } = await supabase
    .from('event_participants')
    .insert(participant)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removeParticipant(id: string): Promise<void> {
  // CASCADE delete en fights
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function addFight(fight: Omit<Fight, 'id' | 'created_at'>): Promise<Fight> {
  const { data, error } = await supabase
    .from('fights')
    .insert(fight)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateFightResult(id: string, result: Fight['result']): Promise<Fight> {
  const { data, error } = await supabase
    .from('fights')
    .update({ result })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFight(id: string): Promise<void> {
  const { error } = await supabase
    .from('fights')
    .delete()
    .eq('id', id)
  if (error) throw error
}
```

---

## Fase 6 — Hooks con React Query

### Patrón general

```typescript
// Pattern:
// - useQuery para datos
// - useMutation para escritura
// - onSuccess: invalidateQueries para refrescar cache
// - Cada hook expone { data, isLoading, error } para queries
// - Cada hook expone { mutate, isPending } para mutations
```

### `useAlumnos.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as alumnosService from '../services/alumnos.service'

export function useAlumnos() {
  return useQuery({
    queryKey: ['alumnos'],
    queryFn: alumnosService.fetchAlumnos,
  })
}

export function useCreateAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: alumnosService.createAlumno,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumnos'] }),
  })
}

export function useUpdateAlumno() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      alumnosService.updateAlumno(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumnos'] }),
  })
}

export function useAddWeightRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: alumnosService.addWeightRecord,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumnos'] }),
  })
}

export function useDeleteWeightRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: alumnosService.deleteWeightRecord,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumnos'] }),
  })
}
```

### `usePagos.ts`

```typescript
export function usePagos() {
  return useQuery({ queryKey: ['pagos'], queryFn: pagosService.fetchPagos })
}

export function useCreatePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pagosService.createPago,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagos'] })
      qc.invalidateQueries({ queryKey: ['alumnos'] }) // cambia estado de pendientes
    },
  })
}

export function useDeletePago() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pagosService.deletePago,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pagos'] })
      qc.invalidateQueries({ queryKey: ['alumnos'] })
    },
  })
}
```

### Mapeo de invalidaciones por hook

| Hook | Queries que invalida |
|------|---------------------|
| `useAlumnos` | `['alumnos']` |
| `usePlanes` | `['planes']` |
| `usePagos` | `['pagos'], ['alumnos']` |
| `useGraduaciones` | `['graduaciones'], ['alumnos']` |
| `useAsistencia` | `['asistencias']` |
| `useHorarios` | `['horarios']` |
| `useEventos` | `['eventos']` |

---

## Fase 7 — Migración de Vistas

### Orden de migración (menor a mayor complejidad)

| # | Vista | Acciones |
|---|-------|----------|
| 1 | `Horarios.tsx` | Reemplazar `useStore()` por `useHorarios()`. Reemplazar `setStore()` por mutaciones |
| 2 | `Cinturones.tsx` | Reemplazar `useStore()` por `useAlumnos()` + `useGraduaciones()` |
| 3 | `Cuotas.tsx` | Reemplazar `useStore()` por `useAlumnos()` + `usePlanes()` + `usePagos()` |
| 4 | `Asistencia.tsx` | Reemplazar `useStore()` por `useAlumnos()` + `useAsistencia()` + `useHorarios()` |
| 5 | `Competencias.tsx` | Solo lectura: reemplazar `useStore()` por `useAlumnos()` + `useEventos()` |
| 6 | `Eventos.tsx` | Reemplazar `useStore()` por `useAlumnos()` + `useEventos()` (mutations anidadas) |
| 7 | `Alumnos.tsx` + modals | El más complejo: reemplazar `useStore()` por todos los hooks necesarios |
| 8 | `Resumen.tsx` | Dashboard read-only: reemplazar `useStore()` por todos los hooks de lectura |

### Patrón de migración por vista

```
1. Identificar qué datos lee la vista (store.alumnos, store.planes, etc.)
2. Identificar qué mutaciones hace (setStore(...))
3. Importar los hooks correspondientes
4. Reemplazar const { store, setStore } = useStore() por const { data, isLoading } = useXxx()
5. Reemplazar cada setStore(...) por la mutación correspondiente
6. Manejar loading states (skeleton/spinner cuando isLoading)
7. Probar que funciona
8. Eliminar imports de useStore de esa vista
```

### Ejemplo: migración de `Horarios.tsx` (antes/después)

**Antes:**
```typescript
const { store, setStore } = useStore();
const horarios = store.horarios;

const handleSave = (h: Horario) => {
  const updated = store.horarios.some(x => x.id === h.id)
    ? store.horarios.map(x => (x.id === h.id ? h : x))
    : [...store.horarios, h].sort(ordenar);
  setStore({ ...store, horarios: updated });
};
```

**Después:**
```typescript
const { data: horarios = [], isLoading } = useHorarios();
const createHorario = useCreateHorario();
const updateHorario = useUpdateHorario();
const deleteHorario = useDeleteHorario();

const handleSave = (h: Schedule) => {
  if (h.id) {
    updateHorario.mutate({ id: h.id, updates: h });
  } else {
    createHorario.mutate(h);
  }
};
```

---

## Fase 8 — Funciones Helper migrables

Las funciones puras de `store.ts` que se usan en las views (`fullName`, `fmtDate`, `fmtMoney`, `currentBelt`, `planDe`, etc.) se migran a `src/features/admin/utils.ts`:

```typescript
// utils.ts
import type { Student, BeltExam, Plan } from './types'

const BELT_ORDER = ['Blanco', 'Amarillo', 'Naranja', 'Verde', 'Azul', 'Marrón', 'Negro']

export function fullName(s: Pick<Student, 'first_name' | 'last_name'>): string {
  return `${s.first_name} ${s.last_name}`.trim()
}

export function currentBelt(graduations: BeltExam[], studentId: string): string {
  const sorted = graduations
    .filter(g => g.student_id === studentId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  return sorted.length ? sorted[0].belt : 'Blanco'
}

export function planDe(plans: Plan[], studentPlanId: string | null): Plan | undefined {
  return plans.find(p => p.id === studentPlanId)
}

export function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

export function periodoActual(): string {
  return new Date().toISOString().slice(0, 7)
}

export function fmtDate(iso: string): string {
  if (!iso) return ''
  try {
    const dt = new Date(iso + 'T12:00:00')
    return dt.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return iso }
}

export function fmtMoney(n: number): string {
  return '$' + Number(n || 0).toLocaleString('es-AR')
}

export function periodoLabel(p: string): string {
  try {
    const parts = p.split('-')
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
      .toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
  } catch { return p }
}

export const BELT_COLORS: Record<string, string> = {
  Blanco: '#e2e8f0',
  Amarillo: '#facc15',
  Naranja: '#fb923c',
  Verde: '#34d399',
  Azul: '#60a5fa',
  Marrón: '#b45309',
  Negro: '#0f172a',
}
```

---

## Fase 9 — Limpieza Final

| # | Acción |
|---|--------|
| 1 | Eliminar `src/features/admin/store.ts` |
| 2 | Eliminar `StoreProvider` de `src/main.tsx` |
| 3 | Eliminar la pista de "Demo: usuario profe..." en `LoginScreen.tsx` |
| 4 | Eliminar función `uid()` (Supabase genera UUIDs con `gen_random_uuid()`) |
| 5 | Eliminar función `seed()` (reemplazada por seed SQL) |
| 6 | Eliminar `localStorage.getItem/setItem` de todo el código |
| 7 | Verificar que no queden imports de `store.ts` en ninguna vista |
| 8 | Ejecutar `pnpm build` para verificar que no hay errores de TypeScript |
| 9 | Probar flujo completo: login → crear alumno → registrar pago → tomar asistencia → crear evento → logout |

---

## Decisiones Arquitectónicas

| Decisión | Elección | Razón |
|----------|----------|-------|
| **Nomenclatura tipos** | snake_case (igual que Supabase) | Evita capa de transformación. Las views de React funcionan bien con snake_case |
| **Capa de servicios** | Funciones puras, sin React | Migrable a API REST/GraphQL. Solo reescribes el interior de cada service |
| **Cache** | React Query con staleTime: 30s | Admin panel single-user, no necesita re-fetch agresivo |
| **Optimistic updates** | No por ahora | Invalidar queries es suficiente. Se puede agregar después si se siente lento |
| **RLS** | Policies por gym_id en cada tabla | Seguridad en la DB. Incluso si el frontend falla, la DB protege |
| **Auth** | Supabase Auth (Email/Password) | Simple, suficiente para un solo usuario. Se puede agregar OAuth después |
| **Migración a API** | Reescribir services | Los hooks y views no cambian. Solo el interior de `services/*.service.ts` |
| **Landing page** | No se toca | Requisito explícito. Si en el futuro se necesitan datos reales, se crea un service público con RLS solo-lectura |
