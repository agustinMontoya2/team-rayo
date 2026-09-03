import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Landing from "./features/landing/Landing.tsx";
import { PublicDataProvider } from "./features/landing/publicStore.tsx";
import { AdminLayout } from "./features/admin/AdminLayout.tsx";
import { StoreProvider } from "./features/admin/store.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { NotFound } from "./components/NotFound.tsx";
import { ViewLoader } from "./components/ViewLoader.tsx";
import "./styles/index.css";

const Overview = lazy(() => import("./features/admin/views/Overview.tsx").then((m) => ({ default: m.Overview })));
const Students = lazy(() => import("./features/admin/views/Students.tsx").then((m) => ({ default: m.Students })));
const Belts = lazy(() => import("./features/admin/views/Belts.tsx").then((m) => ({ default: m.Belts })));
const Fees = lazy(() => import("./features/admin/views/Fees.tsx").then((m) => ({ default: m.Fees })));
const Attendance = lazy(() => import("./features/admin/views/Attendance.tsx").then((m) => ({ default: m.Attendance })));
const Events = lazy(() => import("./features/admin/views/Events.tsx").then((m) => ({ default: m.Events })));
const Competitions = lazy(() => import("./features/admin/views/Competitions.tsx").then((m) => ({ default: m.Competitions })));
const Schedules = lazy(() => import("./features/admin/views/Schedules.tsx").then((m) => ({ default: m.Schedules })));

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ErrorBoundary>
      <Suspense fallback={<ViewLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicDataProvider>
                <Landing />
              </PublicDataProvider>
            }
          />
          <Route
            path="/admin"
            element={
              <StoreProvider>
                <AdminLayout />
              </StoreProvider>
            }
          >
            <Route index element={<Overview />} />
            <Route path="alumnos" element={<Students />} />
            <Route path="cinturones" element={<Belts />} />
            <Route path="cuotas" element={<Fees />} />
            <Route path="asistencia" element={<Attendance />} />
            <Route path="eventos" element={<Events />} />
            <Route path="competencias" element={<Competitions />} />
            <Route path="horarios" element={<Schedules />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </BrowserRouter>
);
