import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./features/landing/Landing.tsx";
import { AdminLayout } from "./features/admin/AdminLayout.tsx";
import { StoreProvider } from "./features/admin/store.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { NotFound } from "./components/NotFound.tsx";
import { Resumen } from "./features/admin/views/Resumen.tsx";
import { Alumnos } from "./features/admin/views/Alumnos.tsx";
import { Cinturones } from "./features/admin/views/Cinturones.tsx";
import { Cuotas } from "./features/admin/views/Cuotas.tsx";
import { Asistencia } from "./features/admin/views/Asistencia.tsx";
import { Eventos } from "./features/admin/views/Eventos.tsx";
import { Competencias } from "./features/admin/views/Competencias.tsx";
import { Horarios } from "./features/admin/views/Horarios.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <StoreProvider>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </StoreProvider>
  </BrowserRouter>
);
