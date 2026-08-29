import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./features/landing/Landing.tsx";
import { AdminLayout } from "./features/admin/AdminLayout.tsx";
import { StoreProvider } from "./features/admin/store.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { NotFound } from "./components/NotFound.tsx";
import { ViewLoader } from "./components/ViewLoader.tsx";
import "./styles/index.css";

const Resumen = lazy(() => import("./features/admin/views/Resumen.tsx").then((m) => ({ default: m.Resumen })));
const Alumnos = lazy(() => import("./features/admin/views/Alumnos.tsx").then((m) => ({ default: m.Alumnos })));
const Cinturones = lazy(() => import("./features/admin/views/Cinturones.tsx").then((m) => ({ default: m.Cinturones })));
const Cuotas = lazy(() => import("./features/admin/views/Cuotas.tsx").then((m) => ({ default: m.Cuotas })));
const Asistencia = lazy(() => import("./features/admin/views/Asistencia.tsx").then((m) => ({ default: m.Asistencia })));
const Eventos = lazy(() => import("./features/admin/views/Eventos.tsx").then((m) => ({ default: m.Eventos })));
const Competencias = lazy(() => import("./features/admin/views/Competencias.tsx").then((m) => ({ default: m.Competencias })));
const Horarios = lazy(() => import("./features/admin/views/Horarios.tsx").then((m) => ({ default: m.Horarios })));

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StoreProvider>
      <ErrorBoundary>
        <Suspense fallback={<ViewLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Resumen />} />
              <Route path="alumnos" element={<Alumnos />} />
              <Route path="cinturones" element={<Cinturones />} />
              <Route path="cuotas" element={<Cuotas />} />
              <Route path="asistencia" element={<Asistencia />} />
              <Route path="eventos" element={<Eventos />} />
              <Route path="competencias" element={<Competencias />} />
              <Route path="horarios" element={<Horarios />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </StoreProvider>
  </BrowserRouter>
);
