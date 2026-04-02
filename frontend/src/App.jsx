import React from 'react'
import Dashboard from './Dashboard.jsx'
import { DashboardProvider } from './state/DashboardStore.jsx'

export default function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  )
}
