import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterAlunoPage } from './pages/RegisterAlunoPage.jsx'
import { RegisterEmpresaPage } from './pages/RegisterEmpresaPage.jsx'
import { VantagensPage } from './pages/VantagensPage.jsx'
import { ExtratoPage } from './pages/ExtratoPage.jsx'
import { EnvioMoedasPage } from './pages/EnvioMoedasPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro/aluno" element={<RegisterAlunoPage />} />
      <Route path="/cadastro/empresa" element={<RegisterEmpresaPage />} />
      <Route path="/vantagens" element={<VantagensPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/extrato" element={<ExtratoPage />} />
        <Route path="/professor/enviar" element={<EnvioMoedasPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
