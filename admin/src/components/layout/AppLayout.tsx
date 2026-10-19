import { NavLink, Outlet } from 'react-router'

import { useAuthStore } from '@/store/authStore'
import { formatPhone } from '@/utils/format'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Users' },
  { to: '/drivers', label: 'Drivers' },
]

const UPCOMING = ['Rides', 'Vehicles', 'Fare rules', 'Payments']

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          RideBook <span>Admin</span>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {n.label}
            </NavLink>
          ))}
          <div className="nav-section">Coming soon</div>
          {UPCOMING.map((label) => (
            <span key={label} className="nav-link disabled">
              {label}
            </span>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div>
            <strong>{user?.name ?? 'Admin'}</strong>
            <span className="muted small">{user ? formatPhone(user.phone) : ''}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
