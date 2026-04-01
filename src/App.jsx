import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './lib/AuthContext'
import './index.css'

// Placeholder components for pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import FormBuilder from './pages/FormBuilder'
import FormsList from './pages/FormsList'
import Admin from './pages/Admin'
import Submissions from './pages/Submissions'
import PublicForm from './pages/PublicForm'
import Empresas from './pages/Empresas'
import Areas from './pages/Areas'
import Usuarios from './pages/Usuarios'
import Workflows from './pages/Workflows'
import Exportaciones from './pages/Exportaciones'
import Auditoria from './pages/Auditoria'
import Sincronizacion from './pages/Sincronizacion'
import Configuracion from './pages/Configuracion'
import MainLayout from './components/ui/MainLayout'

const queryClient = new QueryClient()

const ProtectedRoute = ({ children, role }) => {
  const { user, claims, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#06111C]"><p className="text-white">Cargando...</p></div>
  if (!user) return <Navigate to="/login" />
  if (role && claims.role !== role) return <Navigate to="/" />
  return children
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/view/:formId" element={<PublicForm />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/forms" element={
              <ProtectedRoute>
                <MainLayout><FormsList /></MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/forms/new" element={
              <ProtectedRoute>
                <MainLayout><FormBuilder /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/submissions" element={
              <ProtectedRoute>
                <MainLayout><Submissions /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute role="super_admin">
                <MainLayout><Admin /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/empresas" element={
              <ProtectedRoute role="super_admin">
                <MainLayout><Empresas /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/areas" element={
              <ProtectedRoute role="super_admin">
                <MainLayout><Areas /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/usuarios" element={
              <ProtectedRoute>
                <MainLayout><Usuarios /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/workflows" element={
              <ProtectedRoute>
                <MainLayout><Workflows /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/exportaciones" element={
              <ProtectedRoute>
                <MainLayout><Exportaciones /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/auditoria" element={
              <ProtectedRoute role="super_admin">
                <MainLayout><Auditoria /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/sincronizacion" element={
              <ProtectedRoute>
                <MainLayout><Sincronizacion /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/configuracion" element={
              <ProtectedRoute>
                <MainLayout><Configuracion /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
