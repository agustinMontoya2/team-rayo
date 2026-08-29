Team Rayo — React Codebase Audit
Project: Figma "Make" export for a kickboxing gym management system (Spanish, es-AR). Public landing page + admin panel (students, belts, payments, attendance, events, competitions, schedules).
Stack: React 18 + TypeScript (strict), Vite 6, Tailwind CSS v4 (CSS-first), react-router v7, shadcn/ui (added later, mostly unused) + custom "Pulso" dark design system, localStorage-persisted state via Context + useReducer. No backend yet — a comprehensive planning/SUPABASE-MIGRATION.md exists but is unimplemented.
Severity Summary
Severity
🔴 Critical
🟠 High
🟡 Medium
🔵 Low
⚪ Informational
Findings
🔴 Critical
C1. Hardcoded plaintext credentials and fake client-side authentication
Location
src/features/admin/LoginScreen.tsx:31-33, src/features/admin/AdminLayout.tsx:42
Problem
Login is a hardcoded comparison in the browser: if (usuario === 'profe' && contrasena === 'rayo2026'). The authenticated user is a hardcoded object and isLoggedIn is just a useState(false), reset on reload. There is no session, no server, no token, and the credential is committed in source.
Why it matters
Anyone who can view the source (or the deployed bundle, where the string is trivially greppable) can log in. For an admin panel managing real people (DNI numbers, phone numbers, weight/health data), this is not real authorization. Client-side "authorization" also confers no protection against direct data reading since all data lives in the client's own localStorage.
Evidence
LoginScreen.tsx:31 hardcodes the check; AdminLayout.tsx stores login as component state; user { nombre: 'Daniel', ... } is fabricated at render.
Recommendation
This is only acceptable as a demo gate. Per the existing SUPABASE-MIGRATION.md, move to server auth (Supabase Auth) with RLS. At minimum, before production, gate server-side with real credentials and never ship secrets in the client bundle.
Refactor scope: Large
Confidence: High
C2. All production data persisted only in the browser's localStorage
Location
src/features/admin/store.ts:104-113, 222-242
Problem
The entire system — students (with DNI, phone, birth date, weights), payments, event results, attendance — lives in a single localStorage key team_rayo_mvp_v1. setStore writes the whole store synchronously and there is no backup, sync, or server.
Why it matters
Any user clearing browser data, switching devices, or using private browsing loses the gym's entire operational record irrecoverably. Multiple admins/devices cannot operate on the same data. This is a correctness/data-integrity risk for a real business.
Evidence
store.ts load()/setStore() read/write localStorage.getItem(KEY); KEY = 'team_rayo_mvp_v1'.
Recommendation
The repo already contains a detailed, well-scoped planning/SUPABASE-MIGRATION.md (service layer + React Query hooks). This is the single highest-value architectural investment. Until then, treat the app as a prototype, not production data storage.
Refactor scope: Large
Confidence: High
🟠 High
H1. Monolithic global store couples every domain into one module and one object
Location
src/features/admin/store.ts
Problem
store.ts combines domain types, seed data, normalization/migration logic, localStorage IO, the entire reducer, the Context, the provider, and every date/format/derivation helper (currentBelt, planDe, pendientesPeriodo, ausentesDe, fmtFecha, periodoLabel, fmtMoney, ...) — ~386 lines of six independent concerns. All mutations across all views rebuild the whole store object via { ...store, alumnos: ... }.
Why it matters
Every view re-renders on any change anywhere (single Context). Helpers are coupled to the whole RayoStore shape rather than the slice they use. When Supabase arrives, this module must be reworked wholesale; the domain logic is currently not reusable or testable in isolation.
Evidence
store.ts exports both RayoStore (data) and helper functions that all take d: RayoStore (e.g., currentBelt(d, id)).
Recommendation
Split into: types.ts, domain/helpers.ts (pure functions over slices), seed.ts, persistence.ts, and a small store context. The planned React Query migration (in SUPABASE-MIGRATION.md) naturally resolves this; extracting pure domain helpers now makes that migration testable.
Refactor scope: Large
Confidence: High
H2. Whole-store Context re-renders every view on every keystroke/mutation; mutation API is clumsy
Location
src/features/admin/store.ts:238-256, all views
Problem
StoreProvider exposes a single RayoStore via one Context. Every view in the tree consumes the same object and re-renders on any change. Mutations are done by locally spreading and reconstructing the store 20+ times across views (e.g., Alumnos.tsx toggleAlumno, Asistencia.tsx guardarAsistencia), with no encapsulated mutation functions — domain rules (e.g., "reactivating conserves history", "removing a participant also removes their fights") are inlined into UI click handlers.
Why it matters
Rule duplication and drift: e.g., the "remove participant also removes fights" rule in Eventos.tsx:303-313 must be re-derived manually everywhere fights are filtered. Re-render cost grows as data grows and is a direct blocker when server state (React Query) is introduced.
Evidence
Eventos.tsx, Cuotas.tsx, AlumnoPerfilDrawer.tsx all hand-roll setStore({...store, ...}) mutators.
Recommendation
Introduce a thin domain/action layer (e.g., cuotaActions.registrarPago, alumnoActions.toggleActivo, eventoActions.quitarParticipante) that encapsulate rules and are unit-testable. Pair with the Supabase service layer.
Refactor scope: Large
Confidence: High
H3. Duplicate payment/plan form logic across two components
Location
src/features/admin/views/Cuotas.tsx:269-329 and src/features/admin/views/modals/RegistrarPagoModal.tsx (whole file), plus a third registrarPago in Cuotas.tsx:39-66
Problem
There are two near-identical "Registrar pago" modals (RegistrarPagoModal.tsx and the inline copy in Cuotas.tsx), with duplicated validation (alumno required, monto > 0, fecha required, periodo required, duplicate-period warning). RegistrarPagoModal exists but Cuotas.tsx does not use it — it re-implements the same UI and logic inline.
Why it matters
Two sources of truth for payment rules means fixes must be applied twice and will drift. Resumen.tsx uses the shared modal while Cuotas.tsx uses its own inline copy.
Evidence
Cuotas.tsx:39-66 (registrarPago) duplicates RegistrarPagoModal.tsx:34-62 (registar).
Recommendation
Delete the inline modal in Cuotas.tsx and use the shared RegistrarPagoModal, or extract a single payment-form component used by both.
Refactor scope: Medium
Confidence: High
H4. No tests, linting, or static typechecking configured
Location
package.json (scripts), repo root
Problem
No lint, typecheck, test, or format scripts. No ESLint/Prettier config or deps. No test runner, no _.test._/_.spec._ files, and typescript is not even a devDependency (confirmed: node_modules/typescript absent — typechecking is silently not run; the Vite build uses esbuild/SWC and does not type-check).
Why it matters
The tsconfig.json has noUnusedLocals/noUnusedParameters set to false and types are never verified in CI. Unused code and type errors can ship silently. There is no safety net for the domain logic that is the app's core value. Note: strict is on, so types are checked if someone runs tsc, but nothing does.
Evidence
tsconfig.json disables unused checks; package.json scripts are only dev/build; node_modules/typescript missing.
Recommendation
Add typescript as a devDependency with a typecheck script, plus ESLint + Vitest. Add unit tests for store.ts helpers and the domain actions (recommended in H2).
Refactor scope: Medium
Confidence: High
H5. ~44 unused shadcn/ui components and a large set of unused dependencies bloat the bundle and surface
Location
src/components/ui/ (49 files), package.json
Problem
Only dialog, sheet, accordion, and switch are actually used by the app (src/features grep confirms). The other 45 shadcn components are dead code carrying heavy transitive deps (recharts, react-day-picker, cmdk, embla-carousel, vaul, input-otp, react-resizable-panels, and many Radix primitives). Additionally, @mui/material, @mui/icons-material, @emotion/\*, react-slick, react-popper, react-responsive-masonry, canvas-confetti, react-dnd, react-dnd-html5-backend, next-themes have no imports in src at all.
Why it matters
The production bundle is 405 kB (116 kB gzip) for a small app. Unused deps inflate install size, package-lock, and the attack surface, and confuse maintainers about what's actually supported. Dead UI components invite misuse (someone will reach for a component that was never wired to the design system).
Evidence
Bundle output: index-9gf9YvMU.js 404.97 kB. Grep of src/features for the dedicated UI imports yields only dialog/sheet/accordion/switch.
Recommendation
Prune UI components to those actually used, and remove unused dependencies. Keep the components/ui directory for the used four plus utils.ts/use-mobile.ts. This is safe and reversible.
Refactor scope: Medium
Confidence: High
H6. Data duplication between the landing page and the admin store
Location
src/features/landing/components/Plans.tsx, Schedule.tsx, store.ts (seed)
Problem
Plan data (names, prices $18.000/$25.000, benefit lists) is both hardcoded in Plans.tsx and Schedule.tsx (days/times) AND separately stored in store.ts planes/horarios, which the admin panel edits. The admin subtitle even says "Grilla que se publica en la landing" (AdminLayout.tsx VIEW_TITLES.horarios). Nothing actually publishes edited data to the landing.
Why it matters
The gym owner edits prices/horarios in the admin panel, but the public landing still shows stale hardcoded values. This is a real correctness bug in the product's stated behavior.
Evidence
Plans.tsx:31 $18.000 vs store.ts seed precio: 18000; Schedule.tsx hardcodes days/times that Horarios.tsx manages independently.
Recommendation
Route the landing sections to read from the store (or the future API) so edits propagate, or explicitly decouple and document that landing content is static. Given the landing should be public and admin data syncs via Supabase, resolve during the migration.
Refactor scope: Medium
Confidence: High
🟡 Medium
M1. Dependencies are inconsistent and the React version is ambiguous
Location
package.json
Problem
peerDependencies declare React 18.3.1, but @types/react/@types/react-dom target React 19 (^19.2.x), and react/react-dom are not in dependencies at all. Both package-lock.json (npm) and pnpm-lock.yaml (pnpm) exist, plus a pnpm-workspace.yaml, indicating mixed package-manager usage.
Why it matters
Type definitions can diverge from the runtime React, producing type errors or false type-correctness. Dual lockfiles risk CI/build drift depending on which manager is used.
Evidence
package.json peer deps vs @types/react version; two lockfiles at repo root.
Recommendation
Pick one package manager (pnpm, given the workspace file), remove the other lockfile, and add react/react-dom as explicit dependencies matching a single React version aligned with the types.
Refactor scope: Small
Confidence: High
M2. Non-semantic interactive elements hurt accessibility
Location
Alumnos.tsx:55 (clickable <tr>), Asistencia.tsx:225-234 (custom role="switch" button), Modal.tsx, various <div onClick> elements (e.g., Navbar.tsx logo div)
Problem
The students table row is a <tr> with onClick and a cursor-pointer, with no role/tabIndex/keyboard handling — the eye/edit buttons inside do stopPropagation, but the row itself isn't keyboard-operable. The attendance toggle is a <div>-based switch that reimplements a switch with role="switch"/aria-checked instead of using the (already-installed, accessible) shadcn switch. The Navbar logo is a clickable <div> instead of a link/button.
Why it matters
Keyboard and screen-reader users cannot activate rows or focus controls reliably. There is no focus outline management for modal/drawer transitions (shadcn Dialog handles much of this, but the custom Modal.tsx and Sheet usage rely on defaults).
Evidence
Alumnos.tsx:55 <tr ... onClick onClick={() => setPerfilId(a.id)}>; Navbar.tsx <div ... onClick>.
Recommendation
Make rows keyboard-accessible (or convert row click into an explicit detail button), replace the hand-rolled switch with shadcn switch, and use real links/buttons for clickable divs.
Refactor scope: Medium
Confidence: Medium
M3. Custom Toast system reinvents an installed library
Location
src/features/admin/ui-kit.tsx:111-161 (ToastProvider/useToast), vs src/components/ui/sonner.tsx
Problem
The app ships a full ToastProvider in ui-kit.tsx, while sonner (the shadcn toast library) and its sonner.tsx wrapper are installed but unused. The custom toast uses a setTimeout-based manual stack.
Why it matters
Duplicate mechanism; the codebase maintains its own toast with its own positioning/timing when a battle-tested accessible library is already a dependency.
Evidence
ui-kit.tsx implements toasts; sonner dependency present + components/ui/sonner.tsx present but zero references in src/features.
Recommendation
Either remove sonner, or consolidate on it and drop the custom ToastProvider.
Refactor scope: Small
Confidence: Medium
M4. Form state is transient and duplicated via useState + useEffect resync, rather than a controlled form library
Location
AlumnoFormModal.tsx:26-56 (useEffect reset on open), Eventos.tsx:172-180, AbrirJornadaModal.tsx:22-27, RegistrarPagoModal.tsx:24-32
Problem
Several forms initialize state in a function, then re-sync it in a useEffect keyed on open/edit. This is the classic "state that needs to react to props" anti-pattern; react-hook-form is installed but unused.
Why it matters
The resync effects can fire on every open and are easy to get subtly wrong (stale state when switching between editing different records without closing). Validation is hand-rolled per form, duplicating rules.
Evidence
AlumnoFormModal.tsx useEffect(() => { if (open) { setForm(...) } }, [open]).
Recommendation
Use react-hook-form (already a dependency) for these forms, or at least key child components (key={edit?.id}) so React remounts them instead of the effect-resync pattern.
Refactor scope: Medium
Confidence: Medium
M5. Component-level state reset relies on keyed effect dependencies that can silently miss
Location
Asistencia.tsx:59-67 (useEffect dep [jornada && jornada.id, activos]), Eventos.tsx:272-277, Eventos.tsx:396-402
Problem
Effects gated on [jornada && jornada.id] (a boolean/optional chain expression rather than a stable value) are fragile: the dependency list is semantically [jornada?.id ?? null] but expressed inline, and can trigger or miss resets in edge cases (e.g., navigating between two records quickly). Also, Asistencia.tsx effect missing a dependency on jornada.presentes means reopening the take-attendance modal after an edit may not resync.
Why it matters
Stale modal state; intermittent wrong behavior that's hard to reproduce and debug.
Evidence
Asistencia.tsx:63-67 — the effect deps are [jornada && jornada.id, activos] but the body also reads jornada.presentes; Eventos.tsx:277 similarly.
Recommendation
Use key={jornada?.id} on a child component to force remounting, eliminating the resync effect entirely.
Refactor scope: Small
Confidence: Medium
M6. Non-null assertions and unsafe casts in view code
Location
Asistencia.tsx:267 (a!.id), Cuotas.tsx:325 (planDe(store, pagoAlumno)!.precio), Resumen.tsx:63-79 (React.ReactNode usage), store.ts normalize casts
Problem
Several ! non-null assertions assume runtime values where code already guards (filter(Boolean) at Asistencia.tsx:246 doesn't make the subsequent fullName(a) a non-null to TS, so the author used a!; planDe(...)! after a truthiness check in a template string).
Why it matters
These are correct-ish now but assert away nullability where the type system could instead be satisfied safely; they silently mask future null-returning changes.
Evidence
Asistencia.tsx:267 key={a!.id}; Cuotas.tsx:325 fmtMoney(planDe(...)!.precio).
Recommendation
Refactor to avoid the assertions (narrow with .filter((x): x is Alumno => Boolean(x)) or restructure to compute the plan once into a variable).
Refactor scope: Small
Confidence: High
M7. Localized duplicate formatting/number helpers instead of a single locale utility
Location
Many String(peso).replace('.', ',') inline occurrences across AlumnoPerfilDrawer.tsx, Cinturones.tsx, Competencias.tsx, Cuotas.tsx, Eventos.tsx, Asistencia.tsx
Problem
Spanish number formatting for weights is done inline by repeated .replace('.', ',') chains instead of a helper like store.ts fmtMoney. There's no fmtPeso/fmtNumero.
Why it matters
Inconsistent formatting (e.g., a value arriving with more decimals formats differently) and copy-paste drift; touching formatting requires editing dozens of call sites.
Evidence
Competencias.tsx:92 String(alum.pesoActual).replace('.', ',') repeated across ~8 files.
Recommendation
Add fmtNum(n)/fmtPeso(n) to the domain helper module and replace inline replacements.
Refactor scope: Small
Confidence: High
M8. Navigation duplicated and scattered (two getCurrentView implementations)
Location
AdminLayout.tsx getCurrentView (:16-20) and Topbar.tsx getViewFromPath (:8-12)
Problem
The "current admin view" derivation from the pathname is implemented twice with slightly different logic (AdminLayout handles /admin/ and falls back to resumen; Topbar handles /admin and /). Both are used in separate files, plus VIEW_TITLES maps string keys to titles.
Why it matters
The two functions can diverge; a new route must be registered in multiple places (route, VIEW_TITLES, AdminView union, NAV_GROUPS in Sidebar.tsx).
Evidence
AdminLayout.tsx:16 and Topbar.tsx:8 both parse pathname.
Recommendation
Derive currentView from the router in one place (a hook or inside AdminContext) and have Topbar consume it instead of reimplementing path parsing.
Refactor scope: Small
Confidence: High
🔵 Low
L1. index.html has a mismatched favicon and wrong meta description
Location
index.html
Problem

<link rel="icon" href="/logo.web" /> points to a non-existent .web file (the actual asset is logo.webp), so the favicon 404s. The <meta name="description"> is the generic Figma Make placeholder ("Create stunning landing pages effortlessly...") describing an entirely different product.
Why it matters
Broken favicon and a misleading SEO/social description for a real gym business (mitigated only by noindex, nofollow).
Evidence
index.html:5 .web vs public/assets/logo.webp; index.html:8-11 placeholder description.
Recommendation
Fix the favicon path and write a proper Spanish description.
Refactor scope: Small
Confidence: High
L2. Empty/vestigial source files
Location
src/styles/fonts.css, src/styles/globals.css, default_shadcn_theme.css (root), src/vite-env.d.ts behavior, planning/Guidelines.md
Problem
fonts.css and globals.css are both empty but imported (see styles/index.css barrel). default_shadcn_theme.css at root is a reference copy of a theme that's not actively used (the custom Pulso theme is). Guidelines.md is a placeholder template.
Why it matters
Dead files mislead maintainers about where styling/globals live; the root-level default theme file suggests it's active when it isn't.
Evidence
fonts.css/globals.css empty; default_shadcn_theme.css unused.
Recommendation
Delete or populate the empty files; remove or relocate the root theme reference.
Refactor scope: Small
Confidence: High
L3. Dead exports and misleading helper
Location
ui-kit.tsx (planDeAlumnoRef stub returning its argument unchanged, imported useKeydown maybe unused), store.ts
Problem
planDeAlumnoRef(plan) { return plan; } is a no-op stub with no callers; several exported store utilities may be unused outside the module.
Why it matters
Dead exports add surface confusion.
Recommendation
Remove dead exports; verify usage with a search before deletion.
Refactor scope: Small
Confidence: Medium
L4. Inline arbitrary color hexes instead of theme tokens
Location
AlumnoFormModal.tsx (bg-[#10141D]), Modal.tsx (bg-[#12161F], border-[#303A52], border-[#232B3D]), ui-kit.tsx (bg-[#171C29], #262D3E), AlumnoPerfilDrawer.tsx, Cuotas.tsx
Problem
Many views hardcode raw hex values (#10141D, #12161F, #232B3D, #262D3E, #333B4F) that duplicate the theme's palette values, rather than using the pulso-* tokens defined in theme.css.
Why it matters
The Pulso design-token system exists but is circumvented, so palette changes in theme.css won't propagate and the hardcoded values will drift from the tokens.
Evidence
Modal.tsx:31 bg-[#12161F] equals --pulso-surface value; repeated shadcn-style classes like bg-[#10141D] in every form.
Recommendation
Map the repeated hex literals to design tokens (e.g., a pulso-input/pulso-panel token) as part of the ongoing design-system refactor.
Refactor scope: Medium
Confidence: High
L5. .gitignore is minimal; build artifacts and dual lockfiles committed
Location
.gitignore
Problem
Only node_modules is ignored. dist/ (production build), both lockfiles, and likely pnpm-workspace.yaml-related files are tracked.
Why it matters
Committed build output causes review noise and merge conflicts; the build is reproducible so dist/ should generally be ignored.
Evidence
.gitignore single line node_modules.
Recommendation
Ignore dist/, .env*, editor/OS files; commit exactly one lockfile.
Refactor scope: Small
Confidence: High
L6. Rule inline-formatted number duplicates (peso) create inconsistent displays
Location
Cuotas.tsx:137 carries import { Plus, Pencil, Check, Euro, Users, Wallet, Sparkles } — Euro and Sparkles and other imports partially used; also Resumen.tsx:2 imports useToast but the dashboard shows no toasts (used only by the AbrirJornadaModal onCreated). Several icons imported-but-partially-used across files.
Problem
Minor unused/partially-used imports are scattered (small dead code).
Recommendation
Clean up imports; enable noUnusedLocals/noUnusedParameters (currently disabled, see H4) to catch these automatically.
Refactor scope: Small
Confidence: Medium
⚪ Informational
I1. fmtDate/fmtFecha are the same function exported twice
Location
store.ts:69-73 — fmtDate(iso) just returns fmtFecha(iso).
Observation
Redundant alias. Harmless but consolidating reduces confusion.
I2. Web fonts not defined
fonts.css is empty and no webfont is loaded; the app uses system font stack. Confirm intended typography (the design system sets --font-size: 16px but no font family token) — likely fine for now.
I3. Landing content is largely hardcoded/duplicated with admin data
Beyond plans/schedule (H6), event data (publico) is meant to feed the landing but the landing shows only static sections. Decide whether the landing should become data-driven post-migration.
I4. normalize() performs defensive data migration
store.ts normalize patches legacy shapes (split nombre into nombre/apellido, materialize pesos). Good defensive practice; keep as a dedicated migration layer when moving to a DB.
I5. react-audit-typescript, -performance, -security, -accessibility, -testing skills exist for deeper dives
This audit did quick passes on those dimensions. If any single area (especially performance or accessibility) is a known concern, run the focused skill. Note: no tests/setup exist, so react-audit-testing would mostly confirm the gaps.
I6. The Supabase migration document is unusually thorough (1,564 lines)
Having a detailed migration plan already written is a strong asset — the audit's High-severity items align with executing it.
Refactoring Roadmap
Phase 0 — Do nothing
- System font stack — acceptable; no font needed yet.
- normalize() defensive migration — keep, it's good practice.
- Landing content hardcoded — if the owner accepts static landing copy, this is fine (see H6 decision).
- fmtFecha/fmtDate alias — cosmetic; leave or tidy opportunistically.
Phase 1 — Immediate (correctness & security, before production)
1. Fix auth (C1) — even a demo-credential swap to a configurable-but-not-shipped value, or gate the seed. Highest priority; treats admin as non-public.
2. Fix landing/admin data sync (H6) — either publish store data to Plans/Schedule or explicitly decouple.
3. Fix favicon + meta description (L1) — trivial.
4. Remove degenerate payment duplicate (H3) — single payment form used by both entry points.
Phase 2 — Architectural (module boundaries)
5. Execute Supabase migration (C2) — the single largest win; addresses localStorage data loss and enables real auth (C1). Follow the repo's own plan.
6. Split store.ts (H1) — types.ts, domain/helpers.ts, seed.ts, persistence.ts; extract pure, testable domain actions (H2).
7. Consolidate route/view derivation (M8) — one source for currentView.
8. Move payment/student/event mutations into action functions (H2) so rules aren't inlined in click handlers.
Phase 3 — Quality (typing, error handling, a11y, cleanup)
 9. Add typescript devDep + typecheck, ESLint, Vitest (H4); enable noUnusedLocals/noUnusedParameters.
10. Unit-test domain helpers & actions (from Phase 2 extraction).
11. Accessibility fixes (M2) — keyboard-operable rows, real switch, focus management.
12. Trim unused shadcn components & deps (H5); remove dead exports (L3).
13. Localize number formatting (M7); map inline hexes to tokens (L4).
14. Replace form resync effects (M4/M5) with controlled forms / key remounting.
15. Audit .gitignore (L5).
Phase 4 — Optimization (justified by audit)
16. Whole-store context re-renders (H2) — the store object is recreated on every mutation; with server state (React Query) coming, this is resolved by the migration. Split UI state out of the global object.
17. Bundle size (H5) — pruning unused deps naturally reduces the 405 kB bundle; add route-level lazy loading (React.lazy on /admin children) if caching/budget matters after trimming.
Top 10 changes I would make first
 1. Move auth to real server-side (C1) — hardcoded profe/rayo2026 is a security hole shipping in the bundle.
 2. Begin Supabase persistence (C2) — all business data at risk of permanent loss in localStorage.
 3. Unify the payment form (H3) — two divergent copies of payment rules today.
 4. Publish or decouple landing data (H6) — edited prices/schedules never reach the public site.
 5. Split store.ts into cohesive modules + pure domain actions (H1/H2) — makes logic testable and migration-safe.
 6. Add typescript + typecheck script + ESLint (H4) — currently no static checks run at all.
 7. Prune unused shadcn components & dependencies (H5) — dead code and bundle bloat.
 8. Replace form useEffect resync with controlled/remounted forms (M4/M5) — fixes stale-state bugs.
 9. Accessibility: keyboard-accessible rows, real switch (M2).
10. Fix favicon/meta + .gitignore (L1/L5) — cheap correctness and hygiene.
Architecture Assessment
Architecture
Needs work
Feature folders (landing/, admin/) are a reasonable start and views are reasonably separated, but the whole state layer is one monolithic module, mutation logic lives in UI click handlers, rule logic is duplicated across views (payments especially), and two genuinely distinct apps (public landing, private admin) share one global store.
Maintainability
Needs work
Strong typography/structure in places (consistent shadcn-style UI, good feature splitting), but the single monolithic store, duplicated payment form, scattered path parsing, and dead code undermine a six-months-later maintainer. No lint/test safety net.
Type safety
Acceptable
strict: true is set and the type model (RayoStore entities) is decent. However, types are never enforced (no tsc run), noUnusedLocals is disabled, and there are non-null assertions and unsafe casts (M6) that currently pass but mask future risk.
Performance
Acceptable
Single global Context re-renders every view on every mutation, and store objects are rebuilt wholesale. These are fine at demo scale but are the main growth risk; the 405 kB bundle is trimmed by pruning unused deps. No obvious hot-path perf bugs at this size.
Security
Poor
Hardcoded credentials in source, client-side-only "auth", and all data in easily-accessible/inspectable localStorage. Nothing here currently withstands a determined adversary; acceptable only as a demo.
Accessibility
Needs work
Good practices in places (role="alert", aria-labels on icon buttons, alt on images, semantic forms). But clickable <tr>, a hand-rolled role="switch", clickable <div>s, and reliance on shadcn defaults for dialog focus mean keyboard/screen-reader support is inconsistent.
Testing
Poor
No test framework, no tests, no test script, no lint, no typecheck. The highest-value domain logic (store helpers, domain actions) currently has zero automated coverage.
Next step: This was an audit-only pass — no files were modified. If you'd like, I can run the focused skills (react-audit-typescript, react-audit-accessibility, react-audit-testing, or react-audit-performance) for a deeper pass on any single area, or move into the react-refactor workflow to start executing the roadmap. Which would you prefer?
