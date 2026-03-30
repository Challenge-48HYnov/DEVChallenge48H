import { Navigate, Route, Routes } from 'react-router-dom'
import AtmosShell from './components/AtmosShell'
import MapPage from './pages/MapPage'
import AnalyticsPage from './pages/AnalyticsPage'

export default function AppAtmos() {
  return (
    <AtmosShell>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AtmosShell>
  )
}

