import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { BrandingProvider } from './lib/BrandingProvider'
import './index.css'

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-[#060b13] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Lazy Loaded Pages
const CitizenPortal = lazy(() => import('./pages/CitizenPortal'))
const NotFound = lazy(() => import('./pages/errors/NotFound'))
const ServerError = lazy(() => import('./pages/errors/ServerError'))

import MainLayout from './components/ui/MainLayout'
import JoinOrganization from './components/auth/JoinOrganization'
import ReloadPrompt from './components/ui/ReloadPrompt'
import PremiumSplash from './components/ui/PremiumSplash'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(error.message || 'Error al cargar los datos')
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(error.message || 'Ocurrió un error en la solicitud')
  })
})

const ProtectedRoute = ({ children, role }) => {
  const { user, claims } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && claims.role !== role) return <Navigate to="/" />
  return children
}

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/view/:formId" element={<PublicForm />} />
        <Route path="/portal" element={<CitizenPortal />} />
        
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

        <Route path="/error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              style: {
                background: '#0B1726',
                color: '#fff',
                border: '1px solid #1A2E44'
              }
            }}
          />
          <BrandingProvider>
            <ReloadPrompt />
            <JoinOrganization />
            <Suspense fallback={<PremiumSplash isLoading={true} />}>
              <AppRoutes />
            </Suspense>
          </BrandingProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
