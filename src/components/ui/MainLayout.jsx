import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  LayoutGrid, 
  Database, 
  Settings, 
  LogOut, 
  User, 
  Search, 
  Bell,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { useSubmissions } from "../../api/useSubmissions";
import SyncBanner from "./SyncBanner";

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-emerald-600/10 text-emerald-500 font-medium border-l-4 border-emerald-600"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
      }`}
    >
      <Icon size={20} />
      <span>{children}</span>
    </Link>
  );
};

const MainLayout = ({ children }) => {
  const { logout, claims } = useAuth();
  const { queueCount, isSyncing, syncQueue } = useSubmissions();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/": return "Panel de Control";
      case "/forms": return "Constructor de Formularios";
      case "/submissions": return "Gestor de Respuestas";
      case "/admin": return "Administración del Sistema";
      default: return "FormFlow";
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-inter">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-xl font-bold italic">F</span>
            </div>
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              FormFlow
            </span>
          </div>

          <nav className="space-y-1">
            <SidebarLink to="/" icon={BarChart3}>Dashboard</SidebarLink>
            <SidebarLink to="/forms" icon={LayoutGrid}>Form Builder</SidebarLink>
            <SidebarLink to="/submissions" icon={Database}>Respuestas</SidebarLink>
            <SidebarLink to="/admin" icon={Settings}>Administración</SidebarLink>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                <User size={16} className="text-emerald-500" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Admin Central</p>
                <p className="text-xs text-slate-500 truncate capitalize">{claims.role || 'Super Admin'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{getPageTitle()}</h2>
            <p className="text-xs text-slate-500">Gestión de recursos multitenant activos</p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative group">
               <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Buscar..." 
                 className="bg-slate-950 border border-slate-800 pr-4 pl-10 py-2 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all w-64"
               />
            </div>
            
            <div className="flex items-center space-x-3 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium text-slate-400">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span>ID: {claims.tenantId || "Global_Central"}</span>
            </div>

            <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-all relative">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                </button>
                <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
                <button 
                  onClick={syncQueue}
                  disabled={isSyncing}
                  className={`p-2 rounded-lg transition-all flex items-center space-x-2 ${
                    queueCount > 0 ? "bg-emerald-600/10 text-emerald-500 border border-emerald-500/20" : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <RefreshCw size={20} className={isSyncing ? "animate-spin" : ""} />
                  {queueCount > 0 && <span className="text-xs font-bold leading-none">{queueCount}</span>}
                </button>
            </div>
          </div>
        </header>

        {/* Page Slot */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-10 relative">
          {children}
          <SyncBanner />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
