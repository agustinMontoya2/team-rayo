# Refactorización al Diseño Pulso

## Objetivo
Refactorizar el diseño original de la landing (colores `#111318`, `#22288A`, `#D4243A`) al sistema de diseño **Pulso** (atlética moderna: charcoal azulado, rojo eléctrico, índigo, glass, radios generosos) y agregar un panel de administración completo con el mismo tema.

## Paleta Pulso (referencia)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#0D0F14` | Fondo principal |
| `--surface` | `#141821` | Superficies, cards |
| `--surface2` | `#181D28` | Hover states |
| `--line` | `#262C3A` | Bordes |
| `--fg` | `#F3F5F9` | Texto principal |
| `--muted` | `#98A1B3` | Texto secundario |
| `--red` | `#FF4053` | Acciones primarias (botones, links activos) |
| `--indigo` | `#8B93FF` | Acento informativo, kicker, nav activa |

## Principios de estilo Pulso
- **Nav sticky glass**: `backdrop-filter: blur(14px)`, fondo semitransparente
- **Botones**: `border-radius: 12px`, primary rojo `#FF4053` con texto oscuro
- **Cards**: `border-radius: 16px`, sombras profundas difusas
- **Kickers**: monospace, uppercase, rojos bajo títulos
- **Radios generosos**: 12-20px en todos los elementos interactivos
- **Hover states**: surface2 `#181D28`, transiciones suaves 150ms

## Estructura de cambios

### 1. Tokens de tema (`src/styles/theme.css`)
- Actualizar `:root` y `.dark` con variables Pulso
- Agregar variables custom: `--pulso-red`, `--pulso-indigo`, `--pulso-surface`
- Cambiar `--radius` a `14px`

### 2. Landing — Componentes a refactorizar

| Componente | Cambios clave |
|---|---|
| `App.tsx` | `bg-[#111318]` → `bg-[#0D0F14]` |
| `Navbar.tsx` | Glass nav, blur 14px, rojo `#FF4053`, radios 12px |
| `Hero.tsx` | Gradiente sobre `#0D0F14`, CTA rojo eléctrico, kicker monospace |
| `Coach.tsx` | Surface `#141821`, indigo `#8B93FF`, sombras profundas |
| `Plans.tsx` | Cards radios 16px, sombras difusas, primary rojo, indigo para prices |
| `Gallery.tsx` | Surface `#141821`, overlay Hover |
| `Schedule.tsx` | Header rojo, kicker monospace, bordes indigo |
| `Testimonials.tsx` | Cards sombra difusa, avatar radius 12px, rojo eléctrico |
| `FAQ.tsx` | Acordeón radios 12px, chevron rojo, hover surface2 |
| `Location.tsx` | Cards sombra difusa, botón rojo eléctrico |
| `Footer.tsx` | Surface `#141821`, links rojo, border indigo |
| `FloatingButtons.tsx` | Tooltip fondo surface, botones redondeados |

### 3. Panel de admin (nuevo)

Crear sección `/admin` con:

**Estructura:**
```
src/app/admin/
  AdminApp.tsx        — Layout principal (login + sidebar + views)
  LoginScreen.tsx     — Formulario login
  Sidebar.tsx         — Navegación lateral
  Topbar.tsx          — Barra superior con usuario
  views/
    Resumen.tsx       — Dashboard con KPIs
    Alumnos.tsx       — CRUD de alumnos
    Cuotas.tsx        — Planes y cobros
    Asistencia.tsx    — Registro por jornada
    Eventos.tsx       — Competencias/exhibiciones
    Competencias.tsx  — Detalle de peleas
    Horarios.tsx      — Edición de horarios
```

**Store:** Reutilizar lógica de `rayo-store.js` adaptada a React (context o zustand).

**Tema:** Crear `src/styles/admin-pulso.css` con las variables del tema Pulso para el panel.

### 4. Router
- Agregar `react-router` con rutas:
  - `/` → Landing Pulso
  - `/admin` → Panel admin Pulso

## Orden de ejecución
1. Theme tokens
2. App.tsx + Navbar
3. Hero → Coach → Plans → Gallery → Schedule → Testimonials → FAQ → Location → Footer → FloatingButtons
4. Panel de admin (estructura + vistas)
5. Router
6. Verificación

## Verificación
- `pnpm dev` sin errores de consola
- Colores Pulso visibles en todos los componentes
- Panel admin: login funcional, navegación entre vistas, responsive
- Sin scroll horizontal en mobile (390px)
