import React from 'react'
import { useDashboard } from '../state/DashboardStore.jsx'

export function TopBar({ onAdd }) {
  const { state, setRole, setTheme, resetData } = useDashboard()
  const isAdmin = state.role === 'admin'

  return (
    <div className="topbar">
      <div className="topbarInner">
        <div className="brand">
          <div className="brandTitle">Finance Dashboard</div>
          <span className="badge">mock data • frontend only</span>
        </div>

        <div className="controls">
          <span className="badge" title="Simulated RBAC for UI behavior">
            Role
          </span>
          <div className="field" aria-label="Role switcher">
            <select value={state.role} onChange={(e) => setRole(e.target.value)}>
              <option value="viewer">Viewer (read-only)</option>
              <option value="admin">Admin (can edit)</option>
            </select>
          </div>

          <div className="field" aria-label="Theme switcher">
            <select value={state.theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="system">Theme: System</option>
              <option value="dark">Theme: Dark</option>
              <option value="light">Theme: Light</option>
            </select>
          </div>

          {isAdmin ? (
            <button className="btn btnPrimary" onClick={onAdd}>
              + Add transaction
            </button>
          ) : (
            <button className="btn" disabled title="Switch to Admin to add transactions">
              + Add transaction
            </button>
          )}

          <button className="btn" onClick={resetData} title="Reset to the default seeded dataset">
            Reset data
          </button>
        </div>
      </div>
    </div>
  )
}

