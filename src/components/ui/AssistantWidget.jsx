import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bot, MessageSquare, Sparkles, X, ArrowRight, Send } from "lucide-react";
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

const HELP_BY_ROUTE = {
  "/": "En Dashboard puedes revisar KPIs, respuestas recientes y usar acciones rápidas de gestión.",
  "/forms": "En Formularios puedes crear uno nuevo desde 'Nuevo form' y editar los existentes.",
  "/forms/new": "En Nuevo formulario define campos, secciones y guarda para publicarlo luego.",
  "/submissions": "En Respuestas puedes filtrar por estado y revisar envíos pendientes.",
  "/empresas": "En Empresas puedes ver organizaciones, planes y estado de cada tenant.",
  "/usuarios": "En Usuarios puedes gestionar accesos y roles de personas del sistema.",
  "/workflows": "En Workflows puedes configurar automatizaciones entre eventos y acciones.",
  "/exportaciones": "En Exportaciones puedes descargar datos para análisis o reportes.",
  "/auditoria": "En Auditoría revisas trazabilidad de acciones y cambios del sistema.",
  "/sincronizacion": "En Sincronización puedes monitorear y reintentar sincronizaciones.",
  "/configuracion": "En Configuración ajustas parámetros generales de la plataforma.",
};

const getConfigForPath = (pathname) => {
  if (ROUTE_ASSISTANT_CONFIG[pathname]) return ROUTE_ASSISTANT_CONFIG[pathname];

  // Permite que rutas como /forms/new usen configuración /forms
  const routeKey = Object.keys(ROUTE_ASSISTANT_CONFIG).find((routePrefix) =>
    pathname.startsWith(routePrefix) && routePrefix !== "/",
  );

  return routeKey ? ROUTE_ASSISTANT_CONFIG[routeKey] : DEFAULT_ASSISTANT_CONFIG;
};

const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const KEYWORD_NAV_RULES = [
  {
    keywords: ["dashboard", "inicio", "home", "principal"],
    action: { label: "Ir al Dashboard", path: "/" },
    response: "Te llevo al panel principal para ver el estado general.",
  },
  {
    keywords: ["formulario", "formularios", "form"],
    action: { label: "Ir a Formularios", path: "/forms" },
    response: "Te llevo al módulo de formularios.",
  },
  {
    keywords: ["nuevo formulario", "crear formulario", "alta formulario"],
    action: { label: "Crear nuevo formulario", path: "/forms/new" },
    response: "Perfecto, te llevo a la creación de formularios.",
  },
  {
    keywords: ["respuesta", "respuestas", "pendiente", "revision"],
    action: { label: "Ir a Respuestas", path: "/submissions" },
    response: "Te llevo a respuestas para revisar y filtrar envíos.",
  },
  {
    keywords: ["empresa", "empresas", "tenant"],
    action: { label: "Ir a Empresas", path: "/empresas" },
    response: "Te llevo al módulo de empresas.",
  },
  {
    keywords: ["usuario", "usuarios", "acceso", "rol"],
    action: { label: "Ir a Usuarios", path: "/usuarios" },
    response: "Te llevo al módulo de usuarios y permisos.",
  },
  {
    keywords: ["workflow", "workflows", "automatizacion", "flujo"],
    action: { label: "Ir a Workflows", path: "/workflows" },
    response: "Te llevo a workflows para gestionar automatizaciones.",
  },
  {
    keywords: ["exportar", "exportacion", "descargar", "reporte"],
    action: { label: "Ir a Exportaciones", path: "/exportaciones" },
    response: "Te llevo a exportaciones para descargar información.",
  },
  {
    keywords: ["auditoria", "log", "trazabilidad"],
    action: { label: "Ir a Auditoría", path: "/auditoria" },
    response: "Te llevo a auditoría para revisar actividad.",
  },
  {
    keywords: ["sincronizacion", "sincronizar", "sync"],
    action: { label: "Ir a Sincronización", path: "/sincronizacion" },
    response: "Te llevo al módulo de sincronización.",
  },
  {
    keywords: ["configuracion", "ajustes", "parametros"],
    action: { label: "Ir a Configuración", path: "/configuracion" },
    response: "Te llevo a configuración para ajustar parámetros del sistema.",
  },
];

const HOWTO_RULES = [
  {
    keywords: ["crear formulario", "nuevo formulario", "como creo un formulario", "como crear formulario"],
    response:
      "Para crear un formulario: 1) entra a Formularios, 2) presiona 'Nuevo form', 3) agrega campos y secciones, 4) guarda/publica. Si quieres, te llevo ahora.",
    action: { label: "Ir a crear formulario", path: "/forms/new" },
  },
  {
    keywords: ["exportar", "como exportar", "descargar reporte"],
    response:
      "Para exportar: 1) entra a Exportaciones, 2) elige tipo/rango, 3) genera el archivo y 4) descárgalo. Si quieres, te llevo ahora.",
    action: { label: "Ir a exportaciones", path: "/exportaciones" },
  },
  {
    keywords: ["revisar pendientes", "pendientes", "en revision", "en revision"],
    response:
      "Para revisar pendientes: 1) entra a Respuestas, 2) filtra por estado 'Pendiente/En revisión', 3) abre cada envío y actualiza su estado.",
    action: { label: "Ir a respuestas", path: "/submissions" },
  },
];

const resolveAssistantIntent = (rawQuestion, pathname, activeConfig) => {
  const normalized = normalizeText(rawQuestion);

  if (!normalized) {
    return {
      response: "Escribe una pregunta o una acción, por ejemplo: 'ir a respuestas' o 'cómo crear formulario'.",
      action: null,
    };
  }

  const matchedRule = KEYWORD_NAV_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  const matchedHowTo = HOWTO_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  // Prioriza guías y acciones concretas antes que ayuda genérica.
  if (matchedHowTo) {
    return {
      response: matchedHowTo.response,
      action: matchedHowTo.action,
    };
  }

  if (matchedRule) {
    return {
      response: matchedRule.response,
      action: matchedRule.action,
    };
  }

  if (normalized.includes("ayuda") || normalized.includes("como") || normalized.includes("como ")) {
    const helpText = HELP_BY_ROUTE[pathname] || HELP_BY_ROUTE["/"];
    return {
      response: `${helpText} Si quieres, también puedo llevarte directamente a otra sección.`,
      action: activeConfig.actions?.[0] || null,
    };
  }

  const fallbackAction = activeConfig.actions?.[0] || null;
  return {
    response:
      "No encontré una coincidencia exacta. Prueba con palabras clave como 'formularios', 'respuestas', 'usuarios', 'exportar' o 'auditoría'.",
    action: fallbackAction,
  };
};

export default function AssistantWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);

  const activeConfig = useMemo(() => getConfigForPath(location.pathname), [location.pathname]);

  const onActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const onSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    const result = resolveAssistantIntent(suggestion, location.pathname, activeConfig);
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: suggestion },
      { role: "assistant", text: result.response },
    ]);
    setPendingAction(result.action);
  };

  const onSendQuestion = () => {
    const currentQuestion = question.trim();
    if (!currentQuestion) return;

    const result = resolveAssistantIntent(currentQuestion, location.pathname, activeConfig);
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: currentQuestion },
      { role: "assistant", text: result.response },
    ]);
    setPendingAction(result.action);
    setQuestion("");
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
                    onClick={() => onSuggestionClick(suggestion)}
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
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Pregúntame algo</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") onSendQuestion();
                  }}
                  placeholder="Ej: llévame a respuestas pendientes"
                  className="h-9 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={onSendQuestion}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
                  aria-label="Enviar pregunta"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

            {chatHistory.length ? (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                {chatHistory.slice(-6).map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-lg px-2 py-1.5 text-xs ${
                      message.role === "assistant"
                        ? "bg-slate-900 text-slate-300"
                        : "bg-slate-800 text-white"
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            ) : null}

            {pendingAction ? (
              <button
                type="button"
                onClick={() => onActionClick(pendingAction.path)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-left text-xs font-medium text-white transition-colors hover:border-slate-500"
              >
                <span>{pendingAction.label}</span>
                <ArrowRight size={14} />
              </button>
            ) : null}

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
