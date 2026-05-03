import React, { useState, useEffect, useRef } from "react";
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
  X,
  Activity
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { useBranding } from "../../lib/useBranding";
import SyncBanner from "./SyncBanner";
import Guard from "../auth/Guard";
import NotificationCenter from "./NotificationCenter";
import AnimatedPage from "./AnimatedPage";
import NotificationPrompt from "./NotificationPrompt";
import AssistantWidget from "./AssistantWidget";
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
          ? "bg-slate-800 text-white border-l-2"
          : "text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent"
      }`}
      style={{ 
        borderLeftColor: isActive ? activeColor : 'transparent'
      }}
    >
      {React.createElement(icon, { 
        size: 18, 
        strokeWidth: isActive ? 2.5 : 2, 
        className: isActive ? "" : "text-slate-500 group-hover:text-white transition-colors",
        style: isActive ? { color: activeColor } : {}
      })}
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};

/** Línea divisoria ligera entre grupos de acciones similares (de más a menos uso). */
const SidebarGroupSeparator = () => (
  <div
    className="mx-4 my-1.5 h-px bg-slate-800/80"
    role="separator"
    aria-orientation="horizontal"
    aria-hidden="true"
  />
);

const getGreetingByHour = (hour) => {
  if (hour >= 7 && hour < 12) return { text: "Buenos días", emoji: "☀️" };
  if (hour >= 12 && hour < 18) return { text: "Buenas tardes", emoji: "🌤️" };
  if (hour >= 18 && hour < 24) return { text: "Buenas noches", emoji: "🌙" };
  return { text: "Buen turno nocturno", emoji: "🌙" };
};

const MainLayout = ({ children }) => {
  const { logout, claims, user, currentProfile } = useAuth();
  const { branding } = useBranding();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const municipalLogoPath =
    import.meta.env.VITE_MUNICIPAL_LOGO_PATH?.trim() || "/local-assets/municipal-logo.png";
  const municipalLogoFilter =
    import.meta.env.VITE_MUNICIPAL_LOGO_FILTER?.trim() || "none";
  const localUserIdentity = (claims?.email || user?.email || "anon").toLowerCase();
  const localLogoStorageKey = `formaflow_local_logo_data_url_${localUserIdentity}`;
  const [localLogoOverride] = useState(() => {
    try {
      return (
        window.localStorage.getItem(localLogoStorageKey) ||
        window.localStorage.getItem("formaflow_local_logo_data_url") ||
        ""
      );
    } catch {
      return "";
    }
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  /** Solo cerrar al navegar — NO al abrir el drawer (antes el efecto dependía de isSidebarOpen y lo cerraba al instante). */
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Activa las notificaciones en tiempo real para el administrador
  useSubmissionNotifications();

  // Actualiza el saludo dinámico según la hora local
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const MotionDiv = motion.div;
  const MotionAside = motion.aside;

  const sidebarVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "-100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const navLinks = (
    <nav className="flex-1 overflow-y-auto space-y-0 custom-scrollbar py-2">
      {/* 1 · Inicio */}
      <SidebarLink to="/" icon={LayoutDashboard} activeColor={branding.primary_color}>Dashboard</SidebarLink>
      <SidebarGroupSeparator />

      {/* 2 · Formularios y entregas */}
      <SidebarLink to="/forms" icon={FileText} activeColor={branding.primary_color}>Formularios</SidebarLink>
      <SidebarLink to="/submissions" icon={ClipboardList} activeColor={branding.primary_color}>Respuestas</SidebarLink>
      <SidebarGroupSeparator />

      {/* 3 · Estructura: áreas, empresas, usuarios */}
      <Guard permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
        <SidebarLink to="/areas" icon={MapPin} activeColor={branding.primary_color}>Áreas</SidebarLink>
      </Guard>
      <Guard permission={PERMISSIONS.MANAGE_TENANTS}>
        <SidebarLink to="/empresas" icon={Building2} activeColor={branding.primary_color}>Empresas</SidebarLink>
      </Guard>
      <Guard permission={PERMISSIONS.MANAGE_TENANT_USERS}>
        <SidebarLink to="/usuarios" icon={Users} activeColor={branding.primary_color}>Usuarios</SidebarLink>
      </Guard>
      <SidebarGroupSeparator />

      {/* 4 · Plataforma */}
      <Guard permission={PERMISSIONS.MANAGE_TENANTS}>
        <SidebarLink to="/admin" icon={Shield} activeColor={branding.primary_color}>Admin Panel</SidebarLink>
        <SidebarLink to="/observatorio" icon={Activity} activeColor={branding.primary_color}>Observatorio</SidebarLink>
      </Guard>
      <SidebarGroupSeparator />

      {/* 5 · Automatización y exportación */}
      <Guard permission={PERMISSIONS.MANAGE_TENANT_RESOURCES}>
        <SidebarLink to="/workflows" icon={GitMerge} activeColor={branding.primary_color}>Workflows</SidebarLink>
      </Guard>
      <SidebarLink to="/exportaciones" icon={Download} activeColor={branding.primary_color}>Exportaciones</SidebarLink>
      <SidebarGroupSeparator />

      {/* 6 · Cumplimiento y operaciones centrales */}
      <Guard permission={PERMISSIONS.MANAGE_TENANTS}>
        <SidebarLink to="/auditoria" icon={ShieldCheck} activeColor={branding.primary_color}>Auditoría</SidebarLink>
        <SidebarLink to="/sincronizacion" icon={RefreshCw} activeColor={branding.primary_color}>Sincronización</SidebarLink>
      </Guard>

      <div className="pt-6 mt-2 border-t border-slate-800/50">
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

  const brandLogoSrc = localLogoOverride || branding.logo_url || municipalLogoPath || null;
  const isUsingLocalMunicipalLogo =
    Boolean(brandLogoSrc) &&
    (Boolean(localLogoOverride) || (!branding.logo_url && Boolean(municipalLogoPath)));
  const { text: greetingText, emoji: greetingEmoji } = getGreetingByHour(currentTime.getHours());
  const displayName =
    currentProfile?.full_name ||
    user?.displayName ||
    claims?.name ||
    claims?.email?.split("@")[0] ||
    "Usuario";
  const timeStr = currentTime.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  });

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-inter overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[280px] bg-slate-900 border-r border-slate-800 flex-col shadow-2xl relative z-20">
        <div className="px-2 pt-2 pb-1">
          <div className="flex items-center pb-1 border-b border-slate-800/50 min-h-[92px]">
            {isUsingLocalMunicipalLogo ? (
              <div className="w-full px-4">
                <img
                  src={brandLogoSrc}
                  alt="Logo Municipalidad de San Carlos"
                  className="h-[78px] w-full object-contain object-left select-none"
                  style={{ filter: municipalLogoFilter, mixBlendMode: "screen" }}
                />
              </div>
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500"
                  style={{
                    backgroundColor: branding.primary_color,
                    boxShadow: `0 4px 12px ${branding.primary_color}40`,
                  }}
                >
                  {brandLogoSrc ? (
                    <img src={brandLogoSrc} alt="Logo institucional" className="w-6 h-6 object-contain" />
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
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">SaaS Multi-Tenant</span>
                </div>
              </>
            )}
          </div>
        </div>
        {navLinks}
      </aside>

      {/* Sidebar - Mobile (Drawer) */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <>
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <MotionAside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(100vw-1.25rem,320px)] max-w-[100vw] flex-col overflow-hidden bg-slate-900 shadow-2xl lg:hidden sm:w-[min(100vw-1.5rem,340px)]"
            >
              {/* Columnas iguales a cada lado del logo para mantener el centro; padding según alto de pantalla */}
              <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-x-2 border-b border-slate-800/50 px-3 py-[clamp(1rem,3.5vmin,1.85rem)] min-[420px]:px-5 min-[420px]:py-7">
                <span className="inline-block w-11 shrink-0" aria-hidden />
                <div className="flex min-h-[clamp(4rem,18vmin,6.75rem)] min-w-0 items-center justify-center">
                  {isUsingLocalMunicipalLogo ? (
                    <img
                      src={brandLogoSrc}
                      alt="Logo Municipalidad de San Carlos"
                      className="h-auto w-full max-w-[min(292px,calc(100vw-5.75rem))] object-contain object-center select-none [max-height:clamp(4.25rem,24vmin,7.75rem)] min-[420px]:[max-height:clamp(5rem,22vmin,8.75rem)]"
                      style={{ filter: municipalLogoFilter, mixBlendMode: "screen" }}
                    />
                  ) : (
                    <div
                      className="flex h-[clamp(2.85rem,12vmin,3.85rem)] w-[clamp(2.85rem,12vmin,3.85rem)] shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: branding.primary_color }}
                    >
                      {brandLogoSrc ? (
                        <img
                          src={brandLogoSrc}
                          alt="Logo institucional"
                          className="h-[clamp(1.35rem,5.8vmin,1.85rem)] w-[clamp(1.35rem,5.8vmin,1.85rem)] object-contain"
                          style={!branding.logo_url && municipalLogoFilter !== "none" ? { filter: municipalLogoFilter } : undefined}
                        />
                      ) : (
                        <LayoutDashboard size={26} className="text-white" strokeWidth={2} />
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>
              {navLinks}
            </MotionAside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        <NotificationPrompt />
        
        {/* Header Bar */}
        <header className="h-[80px] border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 relative z-10 shadow-2xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg md:text-xl font-medium text-slate-50 transition-all cursor-default truncate max-w-[260px] md:max-w-none">
                {greetingText} {greetingEmoji} <span className="font-bold">{displayName}</span>
              </h2>
              <span className="text-sm font-black text-emerald-300 hidden md:block tracking-wide">
                {timeStr} · {displayName}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-6">
            <NotificationCenter primaryColor={branding.primary_color} />
            
            <div className="h-10 w-[1px] bg-slate-800 hidden md:block"></div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-white">{displayName}</span>
                <span className="text-xs text-slate-400">Admin</span>
              </div>
              <div 
                className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-xs text-white shadow-xl"
                style={{ borderColor: `${branding.primary_color}30` }}
              >
                {displayName?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative p-0 w-full bg-slate-950">
          <AnimatedPage key={location.pathname}>
            {children}
          </AnimatedPage>
          <SyncBanner />
        </main>
      </div>

      <AssistantWidget />
    </div>
  );
};

export default MainLayout;
