import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
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
  LogOut 
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { useTenants } from "../../api/useTenants";
import SyncBanner from "./SyncBanner";
import Guard from "../auth/Guard";
import NotificationCenter from "./NotificationCenter";
import { PERMISSIONS } from "../../lib/permissions";

const SidebarLink = ({ to, icon, children, activeColor }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');

  return (
    <Link
      to={to}
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
  const { tenants } = useTenants();

  const currentTenant = useMemo(() => {
    return tenants?.find(t => t.id === claims.tenantId) || tenants?.[0];
  }, [tenants, claims.tenantId]);

  const branding = currentTenant?.branding || {
    primary_color: "#10b981",
    logo_url: null
  };

  return (
    <div className="flex h-screen bg-[#060b13] text-white font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a101b] border-r border-slate-800/50 flex flex-col shadow-2xl relative z-20">
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
                 {currentTenant?.name || "FormFlow"}
               </span>
               <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Dashboard</span>
            </div>
          </div>
        </div>

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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#060b13]">
        {/* Header Bar */}
        <header className="h-20 border-b border-slate-800/50 bg-[#0a101b]/80 backdrop-blur-xl flex items-center justify-between px-8 relative z-10 shadow-2xl">
          <div className="flex items-center space-x-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest transition-all hover:text-white cursor-default">
              FormFlow <span className="text-slate-600 px-2">/</span> {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}
            </h2>
          </div>
          
          <div className="flex items-center space-x-6">
            <NotificationCenter primaryColor={branding.primary_color} />
            
            <div className="h-10 w-[1px] bg-white/5"></div>
            
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black text-white uppercase tracking-wider">{claims.email?.split('@')[0]}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administrador</span>
              </div>
              <div 
                className="w-10 h-10 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-xs text-white shadow-xl"
                style={{ borderColor: `${branding.primary_color}30` }}
              >
                {claims.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-0 w-full animate-in fade-in slide-in-from-right-4 duration-700">
          {children}
          <SyncBanner />
        </main>
      </div>

      {/* Edit with Base 44 Badge */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center bg-black/80 rounded-full px-4 py-2 border border-slate-800 shadow-xl backdrop-blur">
          <div 
            className="w-5 h-5 rounded-full mr-2 shadow-lg"
            style={{ 
              backgroundColor: branding.primary_color,
              boxShadow: `0 0 10px ${branding.primary_color}80` 
            }}
          ></div>
          <span className="text-white text-xs font-semibold mr-3">Core <span className="font-bold">FormFlow</span></span>
          <button className="text-slate-400 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
      </div>
    </div>
  );
};

export default MainLayout;
