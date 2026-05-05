import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { AuthProvider } from './lib/AuthContext'
import { BrandingProvider } from './lib/BrandingProvider'
import { PermissionPreviewProvider } from './context/PermissionPreviewContext'
import { useEffectiveClaims } from './context/useEffectiveClaims'
import { hasPermission, hasAnyPermission } from './lib/permissions'
import { PERMISSIONS } from './lib/permissions'
import { db } from "./lib/firebase"
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

const ProtectedRoute = ({ children, role, permission, anyPermissions }) => {
  const { user, claims, logout } = useEffectiveClaims()
  if (!user) return <Navigate to="/login" />
  const status = String(claims?.status || "").toLowerCase();
  if (status === "inactive" || status === "archived" || status === "disabled") {
    return (
      <AccessStateScreen
        title={status === "archived" ? "Tu cuenta está archivada" : "Tu cuenta está desactivada"}
        message="Tu usuario existe, pero está sin acceso operativo en este momento."
        requestType="activation"
        claims={claims}
        user={user}
        logout={logout}
      />
    );
  }
  if (role && claims.role !== role) return <Navigate to="/" />
  if (permission && !hasPermission(claims, permission)) {
    return (
      <AccessStateScreen
        title="No tenés permisos para esta cuenta"
        message="Tu sesión está activa, pero no tenés permisos suficientes para operar en el sistema."
        requestType="permissions"
        claims={claims}
        user={user}
        logout={logout}
      />
    );
  }
  if (anyPermissions?.length && !hasAnyPermission(claims, anyPermissions)) {
    return (
      <AccessStateScreen
        title="No tenés permisos para esta vista"
        message="Solicitá permisos a un Admin o Super Admin para habilitar este módulo."
        requestType="permissions"
        claims={claims}
        user={user}
        logout={logout}
      />
    );
  }
  return children
}

const AccessStateScreen = ({ title, message, requestType, claims, user, logout }) => {
  const requestAccess = async () => {
    const tenantId = claims?.tenantId || claims?.tenant_id || "global";
    const requesterEmail = (user?.email || claims?.email || "sin-correo").toLowerCase();
    await addDoc(collection(db, "Notifications"), {
      title: requestType === "activation" ? "Solicitud de activación de cuenta" : "Solicitud de permisos",
      message:
        requestType === "activation"
          ? `${requesterEmail} solicita activar su cuenta.`
          : `${requesterEmail} solicita permisos o rol para acceder al sistema.`,
      type: "system",
      read: false,
      tenant_id: tenantId,
      requestedBy: requesterEmail,
      requestType,
      target: "admins",
      timestamp: Timestamp.now(),
    });
    toast.success("Solicitud enviada a Admin/Super Admin.");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{message}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={requestAccess}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Solicitar permisos
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

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
          <ProtectedRoute permission={PERMISSIONS.ACCESS_DASHBOARD}>
            <MainLayout><Dashboard /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/forms" element={
          <ProtectedRoute permission={PERMISSIONS.ACCESS_FORMS}>
            <MainLayout><FormsList /></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/forms/new" element={
          <ProtectedRoute permission={PERMISSIONS.ACCESS_FORMS}>
            <MainLayout><FormBuilder /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/submissions" element={
          <ProtectedRoute permission={PERMISSIONS.VIEW_SUBMISSIONS}>
            <MainLayout><Submissions /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute permission={PERMISSIONS.ACCESS_ADMIN_PANEL}>
            <MainLayout><Admin /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/empresas" element={
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANTS}>
            <MainLayout><Empresas /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/areas" element={
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
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
          <ProtectedRoute permission={PERMISSIONS.ACCESS_EXPORT}>
            <MainLayout><Exportaciones /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/auditoria" element={
          <ProtectedRoute permission={PERMISSIONS.VIEW_AUDIT_LOGS}>
            <MainLayout><Auditoria /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/observatorio" element={
          <ProtectedRoute permission={PERMISSIONS.ACCESS_OBSERVATORY}>
            <MainLayout><GlobalMonitor /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/sincronizacion" element={
          <ProtectedRoute permission={PERMISSIONS.MANAGE_TENANTS}>
            <MainLayout><Sincronizacion /></MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/configuracion" element={
          <ProtectedRoute permission={PERMISSIONS.ACCESS_SETTINGS}>
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
        <PermissionPreviewProvider>
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
        </PermissionPreviewProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
