import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/app/layouts/app-shell'
import { HeroPage } from '@/modules/hero/screens/hero-page'
import { DashboardPage } from '@/modules/dashboard/screens/dashboard-page'
import { ImageAnalysisPage } from '@/modules/image-analysis/screens/image-analysis-page'
import { SignalMonitorPage } from '@/modules/signal-monitor/screens/signal-monitor-page'
import { DamageReportPage } from '@/modules/damage-report/screens/damage-report-page'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard"   element={<DashboardPage />} />
          <Route path="/analysis"    element={<ImageAnalysisPage />} />
          <Route path="/signals"     element={<SignalMonitorPage />} />
          <Route path="/report"      element={<DamageReportPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
