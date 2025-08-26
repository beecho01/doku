import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Images from './pages/Images'
import Containers from './pages/Containers'
import Volumes from './pages/Volumes'
import BuildCache from './pages/BuildCache'
import Overlay2 from './pages/Overlay2'
import Logs from './pages/Logs'
import BindMounts from './pages/BindMounts'

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/images" element={<Images />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/volumes" element={<Volumes />} />
          <Route path="/build-cache" element={<BuildCache />} />
          <Route path="/overlay2" element={<Overlay2 />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/bind-mounts" element={<BindMounts />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
