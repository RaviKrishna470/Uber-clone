import { useEffect } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'

import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { DriversPage } from '@/pages/DriversPage'
import { LoginPage } from '@/pages/LoginPage'
import { UsersPage } from '@/pages/UsersPage'
import { useAuthStore } from '@/store/authStore'

function RequireAuth() {
  const status = useAuthStore((s) => s.status)
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace />
}

function GuestOnly() {
  const status = useAuthStore((s) => s.status)
  return status === 'authenticated' ? <Navigate to="/" replace /> : <Outlet />
}

export function AppRoutes() {
  const status = useAuthStore((s) => s.status)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (status === 'loading') return <div className="boot muted">Loading…</div>

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/drivers" element={<DriversPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
