import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { BrandingProvider } from './lib/BrandingProvider'
import { hasPermission } from './lib/permissions'
import { PERMISSIONS } from './lib/permissions'
import './index.css'

const lazyWithRetry = (factory, retries = 1, delayMs = 350) =>
  lazy(async () => {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await factory();
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError;
  });

// Lazy Loaded Pages with retry for smoother navigation
const Login = lazyWithRetry(() => import('./pages/Login'))
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'))
const FormsList = lazyWithRetry(() => import('./pages/FormsList'))
const FormBuilder = lazyWithRetry(() => import('./pages/FormBuilder'))
const Submissions = lazyWithRetry(() => import('./pages/Submissions'))
const PublicForm = lazyWithRetry(() => import('./pages/PublicForm'))
const Admin = lazyWithRetry(() => import('./pages/Admin'))
const Empresas = lazyWithRetry(() => import('./pages/Empresas'))
const Areas = lazyWithRetry(() => import('./pages/Areas'))
const Usuarios = lazyWithRetry(() => import('./pages/Usuarios'))
const Workflows = lazyWithRetry(() => import('./pages/Workflows'))
const Exportaciones = lazyWithRetry(() => import('./pages/Exportaciones'))
const Auditoria = lazyWithRetry(() => import('./pages/Auditoria'))
const Sincronizacion = lazyWithRetry(() => import('./pages/Sincronizacion'))
const Configuracion = lazyWithRetry(() => import('./pages/Configuracion'))
const CitizenPortal = lazyWithRetry(() => import('./pages/CitizenPortal'))
const GlobalMonitor = lazyWithRetry(() => import('./pages/GlobalMonitor'))
const NotFound = lazyWithRetry(() => import('./pages/errors/NotFound'))
const ServerError = lazyWithRetry(() => import('./pages/errors/ServerError'))

import MainLayout from './components/ui/MainLayout'
import JoinOrganization from './components/auth/JoinOrganization'
import ReloadPrompt from './components/ui/ReloadPrompt'
import PremiumSplash from './components/ui/PremiumSplash'
import PWAInstallPrompt from './components/ui/PWAInstallPrompt'

const queryClient = new QueryClient({
  /** Menos refetch automático = menos lecturas Firestore y menos ancho de banda (Blaze). */
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => toast.error(error.message || 'Error al cargar los datos')
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(error.message || 'Ocurrió un error en la solicitud')
  })
})

const CHUNK_ERROR_RELOAD_KEY = 'formaflow_chunk_error_last_reload';
const CHUNK_ERROR_RELOAD_WINDOW_MS = 60 * 1000;

const isChunkLoadError = (message = '') => {
  const normalized = String(message).toLowerCase();
  return (
    normalized.includes('failed to fetch dynamically imported module') ||
    normalized.includes('importing a module script failed') ||
    normalized.includes('loading chunk') ||
    normalized.includes('chunkloaderror')
  );
};

const reloadIfAllowed = () => {
  try {
    const now = Date.now();
    const lastReload = Number(window.sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY) || 0);
    if (!lastReload || now - lastReload > CHUNK_ERROR_RELOAD_WINDOW_MS) {
      window.sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, String(now));
      window.location.reload();
      return;
    }
  } catch {
    // Ignore storage access issues and avoid infinite reload loops.
  }
  toast.error('La app requiere recarga manual por cambio de version. Presiona F5.');
};

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('RouteErrorBoundary captured:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <h2 className="text-lg font-semibold text-white">Error al cargar la vista</h2>
          <p className="mt-2 text-sm text-slate-400">
            Se detectó un error de ejecución. Recarga para reintentar con la versión más reciente.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}

const ProtectedRoute = ({ children, role, permission }) => {
  const { user, claims } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && claims.role !== role) return <Navigate to="/" />
  if (permission && !hasPermission(claims?.role, permission)) return <Navigate to="/" />
  return children
}

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/view/:formId" element={<PublicForm />} />
        <Route path="/public-form/:formId" element={<PublicForm />} />
        <Route path="/public-form" element={<PublicForm />} />
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
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANT_USERS}>
            <MainLayout><Usuarios /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/workflows" element={
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
            <MainLayout><Workflows /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/exportaciones" element={
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
            <MainLayout><Exportaciones /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/auditoria" element={
          <ProtectedRoute role="super_admin">
            <MainLayout><Auditoria /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/observatorio" element={
          <ProtectedRoute role="super_admin">
            <MainLayout><GlobalMonitor /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/sincronizacion" element={
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANTS}>
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
  useEffect(() => {
    const onError = (event) => {
      const message = event?.message || event?.error?.message || '';
      if (isChunkLoadError(message)) {
        reloadIfAllowed();
      }
    };

    const onUnhandledRejection = (event) => {
      const message = event?.reason?.message || event?.reason || '';
      if (isChunkLoadError(message)) {
        reloadIfAllowed();
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

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
            <PWAInstallPrompt />
            <JoinOrganization />
            <RouteErrorBoundary>
              <Suspense fallback={<PremiumSplash isLoading={true} />}>
                <AppRoutes />
              </Suspense>
            </RouteErrorBoundary>
          </BrandingProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
