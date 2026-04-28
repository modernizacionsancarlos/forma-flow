import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Sparkles, X, ArrowRight } from "lucide-react";
import { useBranding } from "../../lib/useBranding";

const ROUTE_ASSISTANT_CONFIG = {
  "/": {
    title: "Asistente del Dashboard",
    description: "Te ayudo a navegar rápido y revisar lo más importante de esta vista.",
    suggestions: [
      "Ver respuestas en revisión",
      "Abrir formularios activos",
      "Ir a actividad reciente",
    ],
    actions: [
      { label: "Respuestas", path: "/submissions" },
      { label: "Formularios", path: "/forms" },
      { label: "Usuarios", path: "/usuarios" },
    ],
  },
  "/forms": {
    title: "Asistente de Formularios",
    description: "Desde aquí puedes crear, revisar y organizar tus formularios.",
    suggestions: [
      "Crear un nuevo formulario",
      "Ver formularios existentes",
      "Abrir respuestas recibidas",
    ],
    actions: [
      { label: "Nuevo formulario", path: "/forms/new" },
      { label: "Listado de formularios", path: "/forms" },
      { label: "Respuestas", path: "/submissions" },
    ],
  },
  "/submissions": {
    title: "Asistente de Respuestas",
    description: "Puedo ayudarte a llegar más rápido a revisión, exportación y auditoría.",
    suggestions: [
      "Revisar pendientes",
      "Ir a exportaciones",
      "Abrir auditoría",
    ],
    actions: [
      { label: "Exportaciones", path: "/exportaciones" },
      { label: "Auditoría", path: "/auditoria" },
      { label: "Dashboard", path: "/" },
    ],
  },
  "/empresas": {
    title: "Asistente de Empresas",
    description: "Accede rápido a usuarios, áreas y configuración de la plataforma.",
    suggestions: [
      "Administrar usuarios",
      "Ver áreas",
      "Volver al dashboard",
    ],
    actions: [
      { label: "Usuarios", path: "/usuarios" },
      { label: "Áreas", path: "/areas" },
      { label: "Dashboard", path: "/" },
    ],
  },
  "/usuarios": {
    title: "Asistente de Usuarios",
    description: "Te guío para gestionar accesos y volver a módulos relacionados.",
    suggestions: [
      "Ir a empresas",
      "Ir a áreas",
      "Configurar parámetros",
    ],
    actions: [
      { label: "Empresas", path: "/empresas" },
      { label: "Áreas", path: "/areas" },
      { label: "Configuración", path: "/configuracion" },
    ],
  },
  "/workflows": {
    title: "Asistente de Workflows",
    description: "Atajos para automatización, exportación y monitoreo.",
    suggestions: [
      "Ir a exportaciones",
      "Ver sincronización",
      "Volver al dashboard",
    ],
    actions: [
      { label: "Exportaciones", path: "/exportaciones" },
      { label: "Sincronización", path: "/sincronizacion" },
      { label: "Dashboard", path: "/" },
    ],
  },
  "/exportaciones": {
    title: "Asistente de Exportaciones",
    description: "Navega entre respuestas, auditoría y panel principal en un clic.",
    suggestions: [
      "Ir a respuestas",
      "Ver auditoría",
      "Volver al dashboard",
    ],
    actions: [
      { label: "Respuestas", path: "/submissions" },
      { label: "Auditoría", path: "/auditoria" },
      { label: "Dashboard", path: "/" },
    ],
  },
  "/auditoria": {
    title: "Asistente de Auditoría",
    description: "Accesos rápidos para revisar operaciones relacionadas.",
    suggestions: [
      "Ir a sincronización",
      "Ver workflows",
      "Volver al dashboard",
    ],
    actions: [
      { label: "Sincronización", path: "/sincronizacion" },
      { label: "Workflows", path: "/workflows" },
      { label: "Dashboard", path: "/" },
    ],
  },
  "/sincronizacion": {
    title: "Asistente de Sincronización",
    description: "Te ayudo a moverte entre auditoría, workflows y configuración.",
    suggestions: [
      "Abrir auditoría",
      "Abrir workflows",
      "Ir a configuración",
    ],
    actions: [
      { label: "Auditoría", path: "/auditoria" },
      { label: "Workflows", path: "/workflows" },
      { label: "Configuración", path: "/configuracion" },
    ],
  },
  "/configuracion": {
    title: "Asistente de Configuración",
    description: "Navegación rápida hacia módulos de operación diaria.",
    suggestions: [
      "Ir a dashboard",
      "Ver usuarios",
      "Abrir formularios",
    ],
    actions: [
      { label: "Dashboard", path: "/" },
      { label: "Usuarios", path: "/usuarios" },
      { label: "Formularios", path: "/forms" },
    ],
  },
};

const DEFAULT_ASSISTANT_CONFIG = {
  title: "Asistente FormFlow",
  description: "Estoy listo para ayudarte a navegar y ejecutar acciones rápidas.",
  suggestions: ["Volver al dashboard", "Abrir formularios", "Abrir respuestas"],
  actions: [
    { label: "Dashboard", path: "/" },
    { label: "Formularios", path: "/forms" },
    { label: "Respuestas", path: "/submissions" },
  ],
};

const getConfigForPath = (pathname) => {
  if (ROUTE_ASSISTANT_CONFIG[pathname]) return ROUTE_ASSISTANT_CONFIG[pathname];

  // Permite que rutas como /forms/new usen configuración /forms
  const routeKey = Object.keys(ROUTE_ASSISTANT_CONFIG).find((routePrefix) =>
    pathname.startsWith(routePrefix) && routePrefix !== "/",
  );

  return routeKey ? ROUTE_ASSISTANT_CONFIG[routeKey] : DEFAULT_ASSISTANT_CONFIG;
};

export default function AssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");

  const activeConfig = useMemo(() => getConfigForPath(location.pathname), [location.pathname]);

  const onActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="w-[340px] max-w-[90vw] rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: `${branding.primary_color}22` }}
              >
                <Bot size={16} style={{ color: branding.primary_color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Asistente</p>
                <p className="text-[11px] text-slate-400">Contextual por vista</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Cerrar asistente"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-white">{activeConfig.title}</p>
              <p className="mt-1 text-xs text-slate-400">{activeConfig.description}</p>
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Sparkles size={12} />
                Sugerencias
              </p>
              <div className="flex flex-wrap gap-2">
                {activeConfig.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSelectedSuggestion(suggestion)}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              {selectedSuggestion ? (
                <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                  {selectedSuggestion}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <MessageSquare size={12} />
                Acciones rápidas
              </p>
              <div className="grid grid-cols-1 gap-2">
                {activeConfig.actions.map((action) => (
                  <button
                    key={action.path + action.label}
                    type="button"
                    onClick={() => onActionClick(action.path)}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/70"
                  >
                    <span>{action.label}</span>
                    <ArrowRight size={14} className="text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-3 flex items-center rounded-full border border-slate-800 bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur transition-transform hover:scale-[1.02]"
      >
        <div
          className="mr-2 h-5 w-5 rounded-full shadow-lg"
          style={{
            backgroundColor: branding.primary_color,
            boxShadow: `0 0 10px ${branding.primary_color}80`,
          }}
        />
        <span>Asistente</span>
      </button>
    </div>
  );
}
