import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type Props = {
  children: ReactNode
}

export default function AtmosShell({ children }: Props) {
  return (
    <div className="atmos-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <span className="brand-title">AtmosObserver</span>
          </div>
        </div>
        <div className="topbar-right">
          <input
            className="topbar-search"
            type="text"
            placeholder="Rechercher une station..."
            aria-label="Rechercher une station"
          />
        </div>
      </header>

      <aside className="sidenav">
        <div className="sidenav-header">
          <div className="sidenav-title">Observer Alpha</div>
          <div className="sidenav-subtitle">Station 04-B • (demo)</div>
        </div>

        <nav className="sidenav-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}
          >
            <span className="nav-icon" aria-hidden="true">
              🗺️
            </span>
            Map View
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => (isActive ? 'nav-item is-active' : 'nav-item')}
          >
            <span className="nav-icon" aria-hidden="true">
              📈
            </span>
            Analytics
          </NavLink>
        </nav>

        <div className="sidenav-footer">
          <div className="sidenav-footerItem">Settings</div>
          <div className="sidenav-footerItem">Support</div>
        </div>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  )
}

