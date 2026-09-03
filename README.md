# Team Rayo

Sistema de gestión para un gimnasio de kick boxing (es-AR). Incluye una **landing pública** para clientes y un **panel de administración** para el profesor con registro de alumnos, cuotas, asistencia, eventos y más.

## Stack

- **React 18 + TypeScript** con Vite 6
- **React Router v7** (rutas)
- **Tailwind CSS v4**
- **Radix UI** (dialog, accordion, switch) + `lucide-react` (iconos)
- **Vitest** (tests unitarios)
- Sin backend: los datos se persisten en `localStorage` bajo la clave `team_rayo_mvp_v1`

## Estructura

```
src/
  main.tsx                    # Punto de entrada + rutas
  features/
    landing/                  # Página pública (clientes)
    admin/                    # Panel de administración
      AdminLayout.tsx         # Login, sidebar y layout
      store.ts                # Contexto React + useReducer sobre el store
      domain/                 # Lógica pura, sin React
        types.ts              # Modelos de datos
        actions.ts            # Transiciones de estado (acciones)
        helpers.ts            # Consultas derivadas
        format.ts             # Formateo de fechas/moneda (es-AR)
        persistence.ts        # Carga/guardado en localStorage
        seed.ts               # Datos iniciales + normalización
        __tests__/            # Tests de Vitest
      views/                  # Páginas del panel
      components/
      ui/                     # Wrappers de Radix (dialog, sheet, switch, accordion)
```

## Rutas

| Ruta | Descripción |
| --- | --- |
| `/` | Landing pública |
| `/admin` | Panel admin (Resumen) |
| `/admin/alumnos` | Registro y perfiles de alumnos |
| `/admin/cinturones` | Graduaciones y progreso |
| `/admin/cuotas` | Planes y pagos mensuales |
| `/admin/asistencia` | Jornadas de entrenamiento |
| `/admin/eventos` | Competencias, exhibiciones y talleres |
| `/admin/competencias` | Historial competitivo |
| `/admin/horarios` | Grilla de horarios |

## Comandos

```bash
npm i            # Instalar dependencias
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run test     # Ejecutar tests (Vitest)
npm run typecheck # Verificación de tipos (tsc --noEmit)
```

## Modelo de datos

El estado completo se guarda en `localStorage`. Las entidades principales son:

- **Alumno** — datos personales, `fechaIngreso`, plan, peso y foto.
- **Plan** — planes recreativo/competitivo con precio y beneficios.
- **Cuota** — pago mensual por alumno (período `YYYY-MM`).
- **Jornada** — sesión de asistencia con su lista de presentes.
- **Graduacion** — cinturón y puntuación por examen.
- **Evento** — competencia/exhibición/taller, con participantes y peleas.
- **Horario** — franja de entrenamiento reutilizable en las jornadas.

## Notas de dominio

- **Asistencia**: al tomar/ver asistencia solo se consideran alumnos cuya `fechaIngreso` es anterior o igual a la fecha de la jornada; quien aún no ingresó no cuenta como ausente.
- **Cuotas pendientes**: un alumno solo figura como pendiente de un período si ya estaba inscrito durante ese mes.
- **Eliminaciones**: las acciones destructivas (pagos, jornadas, eventos, horarios, pesos, peleas, participantes) piden confirmación antes de ejecutarse.
