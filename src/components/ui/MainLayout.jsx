import React from "react";
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
import SyncBanner from "./SyncBanner";

const SidebarLink = ({ to, icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
        isActive
          ? "bg-[#0b1b1b] text-[#10b981] border-l-2 border-[#10b981]"
          : "text-slate-400 hover:bg-[#0b1b1b]/50 hover:text-slate-200 border-l-2 border-transparent"
      }`}
    >
      {React.createElement(icon, { size: 18, strokeWidth: isActive ? 2.5 : 2, className: isActive ? "text-[#10b981]" : "text-slate-500" })}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};

const MainLayout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-[#060b13] text-white font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a101b] border-r border-slate-800/50 flex flex-col shadow-2xl relative z-20">
        <div className="p-6">
          <div className="flex items-center space-x-3 pb-8 border-b border-slate-800/50">
            <div className="w-9 h-9 bg-[#10b981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10b981]/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="flex flex-col">
               <span className="text-base font-bold text-white tracking-tight leading-none bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                 FormFlow
               </span>
               <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">SaaS Multi-Tenant</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-1 custom-scrollbar py-2">
          <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink to="/admin" icon={Shield}>Admin Panel</SidebarLink>
          <SidebarLink to="/empresas" icon={Building2}>Empresas</SidebarLink>
          <SidebarLink to="/areas" icon={MapPin}>Áreas</SidebarLink>
          <SidebarLink to="/forms" icon={FileText}>Formularios</SidebarLink>
          <SidebarLink to="/submissions" icon={ClipboardList}>Respuestas</SidebarLink>
          <SidebarLink to="/usuarios" icon={Users}>Usuarios</SidebarLink>
          <SidebarLink to="/workflows" icon={GitMerge}>Workflows</SidebarLink>
          <SidebarLink to="/exportaciones" icon={Download}>Exportaciones</SidebarLink>
          <SidebarLink to="/auditoria" icon={ShieldCheck}>Auditoría</SidebarLink>
          <SidebarLink to="/sincronizacion" icon={RefreshCw}>Sincronización</SidebarLink>
          
          <div className="pt-6 mt-6 border-t border-slate-800/50">
             <SidebarLink to="/configuracion" icon={Settings}>Configuración</SidebarLink>
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
        <main className="flex-1 overflow-y-auto relative p-0 w-full">
          {children}
          <SyncBanner />
        </main>
      </div>

      {/* Edit with Base 44 Badge */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center bg-black/80 rounded-full px-4 py-2 border border-slate-800 shadow-xl backdrop-blur">
          <div className="w-5 h-5 bg-[#f97316] rounded-full mr-2 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
          <span className="text-white text-xs font-semibold mr-3">Edit with <span className="font-bold">Base 44</span></span>
          <button className="text-slate-400 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
      </div>
    </div>
  );
};

export default MainLayout;
