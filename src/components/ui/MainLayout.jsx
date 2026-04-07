import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Shield, 
  Building2, 
  MapPin, 
  FileText, 
  ClipboardList, 
  Users, 
  GitMerge, 
  Download, 
  ShieldCheck,
  RefreshCw,
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { useBranding } from "../../lib/useBranding";
import SyncBanner from "./SyncBanner";
import Guard from "../auth/Guard";
import NotificationCenter from "./NotificationCenter";
import AnimatedPage from "./AnimatedPage";
import NotificationPrompt from "./NotificationPrompt";
import PWAInstallPrompt from "./PWAInstallPrompt";
import { PERMISSIONS } from "../../lib/permissions";
import { useSubmissionNotifications } from "../../api/useSubmissionNotifications";

const SidebarLink = ({ to, icon, children, activeColor, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
        isActive
          ? "bg-[#0b1b1b] border-l-2"
          : "text-slate-400 hover:bg-[#0b1b1b]/50 hover:text-slate-200 border-l-2 border-transparent"
      }`}
      style={{ 
        color: isActive ? activeColor : undefined,
        borderLeftColor: isActive ? activeColor : 'transparent'
      }}
    >
      {React.createElement(icon, { 
        size: 18, 
        strokeWidth: isActive ? 2.5 : 2, 
        className: !isActive ? "text-slate-500" : "",
        style: isActive ? { color: activeColor } : {}
      })}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};

const MainLayout = ({ children }) => {
  const { logout, claims } = useAuth();
  const { branding } = useBranding();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Cerrar sidebar cuando cambia la ruta (solo en móvil)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Activa las notificaciones en tiempo real para el administrador
  useSubmissionNotifications();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const navLinks = (
    <nav className="flex-1 overflow-y-auto space-y-1 custom-scrollbar py-2">
      <SidebarLink to="/" icon={LayoutDashboard} activeColor={branding.primary_color}>Dashboard</SidebarLink>
      
      <Guard permission={PERMISSIONS.MANAGE_TENANTS}>
        <SidebarLink to="/admin" icon={Shield} activeColor={branding.primary_color}>Admin Panel</SidebarLink>
        <SidebarLink to="/empresas" icon={Building2} activeColor={branding.primary_color}>Empresas</SidebarLink>
      </Guard>

      <Guard permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
        <SidebarLink to="/areas" icon={MapPin} activeColor={branding.primary_color}>Áreas</SidebarLink>
      </Guard>

      <SidebarLink to="/forms" icon={FileText} activeColor={branding.primary_color}>Formularios</SidebarLink>
      <SidebarLink to="/submissions" icon={ClipboardList} activeColor={branding.primary_color}>Respuestas</SidebarLink>
      
      <Guard permission={PERMISSIONS.MANAGE_TENANT_USERS}>
        <SidebarLink to="/usuarios" icon={Users} activeColor={branding.primary_color}>Usuarios</SidebarLink>
      </Guard>

      <Guard permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
        <SidebarLink to="/workflows" icon={GitMerge} activeColor={branding.primary_color}>Workflows</SidebarLink>
      </Guard>

      <SidebarLink to="/exportaciones" icon={Download} activeColor={branding.primary_color}>Exportaciones</SidebarLink>
      
      <Guard permission={PERMISSIONS.MANAGE_TENANTS}>
        <SidebarLink to="/auditoria" icon={ShieldCheck} activeColor={branding.primary_color}>Auditoría</SidebarLink>
        <SidebarLink to="/sincronizacion" icon={RefreshCw} activeColor={branding.primary_color}>Sincronización</SidebarLink>
      </Guard>
      
      <div className="pt-6 mt-6 border-t border-slate-800/50">
         <SidebarLink to="/configuracion" icon={Settings} activeColor={branding.primary_color}>Configuración</SidebarLink>
         <button
           onClick={logout}
           className="w-full flex items-center space-x-3 px-6 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-[#0b1b1b]/50 border-l-2 border-transparent transition-colors"
         >
           <LogOut size={18} className="text-slate-500 hover:text-red-400" />
           <span>Cerrar sesión</span>
         </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen bg-[#060b13] text-white font-inter overflow-hidden">
      <PWAInstallPrompt />
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#0a101b] border-r border-slate-800/50 flex-col shadow-2xl relative z-20">
        <div className="p-6">
          <div className="flex items-center space-x-3 pb-8 border-b border-slate-800/50">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500"
              style={{ 
                backgroundColor: branding.primary_color,
                boxShadow: `0 4px 12px ${branding.primary_color}40`
              }}
            >
              {branding.logo_url ? (
                <img src={branding.logo_url} alt="Logo" className="w-6 h-6 object-contain" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
               <span className="text-base font-bold text-white tracking-tight leading-none truncate w-32">
                 {branding.name || "FormFlow"}
               </span>
               <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dashboard</span>
            </div>
          </div>
        </div>
        {navLinks}
      </aside>

      {/* Sidebar - Mobile (Drawer) */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 left-0 w-72 bg-[#0a101b] z-50 lg:hidden flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <LayoutDashboard size={18} className="text-white" />
                  </div>
                  <span className="font-bold">FormaFlow</span>
                </div>
                <button onClick={toggleSidebar} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              {navLinks}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#060b13]">
        <NotificationPrompt />
        
        {/* Header Bar */}
        <header className="h-20 border-b border-slate-800/50 bg-[#0a101b]/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 relative z-10 shadow-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest transition-all hover:text-white cursor-default truncate max-w-[150px] md:max-w-none">
              FormFlow <span className="text-slate-600 px-1 md:px-2">/</span> {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6">
            <NotificationCenter primaryColor={branding.primary_color} />
            
            <div className="h-10 w-[1px] bg-white/5 hidden md:block"></div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-black text-white uppercase tracking-wider">{claims.email?.split('@')[0]}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin</span>
              </div>
              <div 
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-xs text-white shadow-xl"
                style={{ borderColor: `${branding.primary_color}30` }}
              >
                {claims.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-0 w-full bg-[#060b13]">
          <AnimatedPage key={location.pathname}>
            {children}
          </AnimatedPage>
          <SyncBanner />
        </main>
      </div>

      <div className="hidden sm:flex fixed bottom-6 right-6 z-30 items-center bg-black/80 rounded-full px-4 py-2 border border-slate-800 shadow-xl backdrop-blur">
          <div 
            className="w-5 h-5 rounded-full mr-2 shadow-lg"
            style={{ 
              backgroundColor: branding.primary_color,
              boxShadow: `0 0 10px ${branding.primary_color}80` 
            }}
          ></div>
          <span className="text-white text-xs font-semibold">Core <span className="font-bold">FormFlow</span></span>
      </div>
    </div>
  );
};

export default MainLayout;
