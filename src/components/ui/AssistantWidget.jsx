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

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

const includesAll = (text, terms) => terms.every((term) => text.includes(term));

const pickVariant = (variants, seed) => {
  if (!Array.isArray(variants) || !variants.length) return "";
  return variants[seed % variants.length];
};

const getRoutePriorityBonus = (pathname, actionPath) => {
  if (!pathname || !actionPath) return 0;
  if (pathname === actionPath) return 3;
  if (pathname.startsWith(actionPath) || actionPath.startsWith(pathname)) return 2;
  return 0;
};

const GREETING_TERMS = ["hola", "buenas", "buen dia", "buen día", "buenas tardes", "buenas noches", "hey"];
const FAREWELL_TERMS = ["gracias", "chau", "adios", "adiós", "nos vemos", "listo gracias"];
const CONFIRM_TERMS = ["si", "sí", "dale", "ok", "bueno", "perfecto", "de una", "llévame", "llevame", "abrilo", "ábrelo"];
const CANCEL_TERMS = ["cancelar", "no", "mejor no", "espera", "pará", "para"];

const KEYWORD_NAV_RULES = [
  {
    keywords: ["dashboard", "inicio", "home", "principal", "panel", "portada", "resumen"],
    action: { label: "Ir al Dashboard", path: "/" },
    responses: [
      "Te llevo al panel principal para ver el estado general.",
      "Vamos al dashboard para que revises el resumen general.",
      "Perfecto, te redirijo al inicio para ver los indicadores.",
    ],
  },
  {
    keywords: ["formulario", "formularios", "form", "tramite", "tramites", "expediente", "expedientes"],
    action: { label: "Ir a Formularios", path: "/forms" },
    responses: [
      "Te llevo al módulo de formularios.",
      "Vamos a Formularios para gestionar tus plantillas.",
      "Listo, te dirijo a la vista de formularios.",
    ],
  },
  {
    keywords: ["nuevo formulario", "crear formulario", "alta formulario", "nuevo tramite", "crear tramite"],
    action: { label: "Crear nuevo formulario", path: "/forms/new" },
    responses: [
      "Perfecto, te llevo a la creación de formularios.",
      "Vamos al constructor para crear uno nuevo.",
      "Te abro la pantalla de alta de formulario.",
    ],
  },
  {
    keywords: ["respuesta", "respuestas", "pendiente", "revision", "revisión", "envio", "envíos", "solicitud"],
    action: { label: "Ir a Respuestas", path: "/submissions" },
    responses: [
      "Te llevo a respuestas para revisar y filtrar envíos.",
      "Vamos a Respuestas para ver pendientes y en revisión.",
      "Te redirijo a Submissions para que gestiones solicitudes.",
    ],
  },
  {
    keywords: ["empresa", "empresas", "tenant", "organizacion", "organización", "institucion", "institución"],
    action: { label: "Ir a Empresas", path: "/empresas" },
    responses: [
      "Te llevo al módulo de empresas.",
      "Vamos a Empresas para revisar organizaciones registradas.",
      "Te dirijo a la sección de tenants/empresas.",
    ],
  },
  {
    keywords: ["usuario", "usuarios", "acceso", "rol", "permisos", "persona", "personas"],
    action: { label: "Ir a Usuarios", path: "/usuarios" },
    responses: [
      "Te llevo al módulo de usuarios y permisos.",
      "Vamos a Usuarios para gestionar accesos y roles.",
      "Te redirijo a la sección de personas y permisos.",
    ],
  },
  {
    keywords: ["workflow", "workflows", "automatizacion", "flujo", "automatización", "regla", "reglas"],
    action: { label: "Ir a Workflows", path: "/workflows" },
    responses: [
      "Te llevo a workflows para gestionar automatizaciones.",
      "Vamos a Workflows para configurar reglas automáticas.",
      "Te redirijo al módulo de flujos automáticos.",
    ],
  },
  {
    keywords: ["exportar", "exportacion", "exportación", "descargar", "reporte", "informes", "excel", "csv", "pdf"],
    action: { label: "Ir a Exportaciones", path: "/exportaciones" },
    responses: [
      "Te llevo a exportaciones para descargar información.",
      "Vamos a Exportaciones para generar reportes.",
      "Te redirijo al módulo de descargas y reportes.",
    ],
  },
  {
    keywords: ["auditoria", "auditoría", "log", "trazabilidad", "historial", "movimientos"],
    action: { label: "Ir a Auditoría", path: "/auditoria" },
    responses: [
      "Te llevo a auditoría para revisar actividad.",
      "Vamos a Auditoría para ver trazabilidad de cambios.",
      "Te redirijo al historial de operaciones.",
    ],
  },
  {
    keywords: ["sincronizacion", "sincronización", "sincronizar", "sync", "integracion", "integración", "actualizar datos"],
    action: { label: "Ir a Sincronización", path: "/sincronizacion" },
    responses: [
      "Te llevo al módulo de sincronización.",
      "Vamos a Sincronización para revisar integraciones.",
      "Te redirijo al panel de sincronización de datos.",
    ],
  },
  {
    keywords: ["configuracion", "configuración", "ajustes", "parametros", "parámetros", "preferencias"],
    action: { label: "Ir a Configuración", path: "/configuracion" },
    responses: [
      "Te llevo a configuración para ajustar parámetros del sistema.",
      "Vamos a Configuración para cambiar ajustes generales.",
      "Te redirijo al panel de preferencias.",
    ],
  },
];

const HOWTO_RULES = [
  {
    keywords: [
      "crear formulario",
      "nuevo formulario",
      "como creo un formulario",
      "como crear formulario",
      "crear un formulario",
      "armar formulario",
      "generar formulario",
      "crear tramite",
      "nuevo tramite",
      "crear expediente",
    ],
    response:
      "Para crear un formulario: 1) entra a Formularios, 2) presiona 'Nuevo form', 3) agrega campos y secciones, 4) guarda/publica. Si quieres, te llevo ahora.",
    action: { label: "Ir a crear formulario", path: "/forms/new" },
  },
  {
    keywords: ["exportar", "como exportar", "descargar reporte", "descargar excel", "descargar csv", "sacar reporte"],
    response:
      "Para exportar: 1) entra a Exportaciones, 2) elige tipo/rango, 3) genera el archivo y 4) descárgalo. Si quieres, te llevo ahora.",
    action: { label: "Ir a exportaciones", path: "/exportaciones" },
  },
  {
    keywords: ["revisar pendientes", "pendientes", "en revision", "en revisión", "revisar envios", "revisar solicitudes"],
    response:
      "Para revisar pendientes: 1) entra a Respuestas, 2) filtra por estado 'Pendiente/En revisión', 3) abre cada envío y actualiza su estado.",
    action: { label: "Ir a respuestas", path: "/submissions" },
  },
  {
    keywords: ["crear usuario", "nuevo usuario", "dar acceso", "asignar rol", "permisos de usuario"],
    response:
      "Para crear un usuario: 1) entra a Usuarios, 2) crea/invita usuario, 3) asigna rol y permisos, 4) confirma acceso.",
    action: { label: "Ir a usuarios", path: "/usuarios" },
  },
  {
    keywords: ["crear workflow", "automatizar", "regla automatica", "regla automática", "flujo automatico", "flujo automático"],
    response:
      "Para automatizar: 1) entra a Workflows, 2) define evento disparador, 3) configura acciones, 4) guarda y activa.",
    action: { label: "Ir a workflows", path: "/workflows" },
  },
  {
    keywords: ["ver historial", "quien cambio", "quién cambió", "auditar cambios", "trazabilidad"],
    response:
      "Para auditar cambios: 1) entra a Auditoría, 2) filtra por fecha/usuario/acción, 3) revisa el detalle del evento.",
    action: { label: "Ir a auditoría", path: "/auditoria" },
  },
];

const resolveAssistantIntent = (
  rawQuestion,
  pathname,
  activeConfig,
  responseSeed = 0,
  conversationContext = {},
) => {
  const normalized = normalizeText(rawQuestion);
  const {
    lastSuggestedAction = null,
  } = conversationContext;

  if (!normalized) {
    return {
      response: "Escribe una pregunta o una acción, por ejemplo: 'ir a respuestas' o 'cómo crear formulario'.",
      action: null,
      intentLabel: "Entrada vacía",
    };
  }

  if (includesAny(normalized, GREETING_TERMS)) {
    return {
      response: "¡Hola! Estoy listo para ayudarte. Puedes pedirme una acción o preguntarme cómo hacer algo.",
      action: null,
      intentLabel: "Saludo",
    };
  }

  if (includesAny(normalized, FAREWELL_TERMS)) {
    return {
      response: "Perfecto. Cuando quieras seguimos, estoy aquí para ayudarte.",
      action: null,
      intentLabel: "Despedida",
    };
  }

  if (includesAny(normalized, CANCEL_TERMS) && lastSuggestedAction) {
    return {
      response: "Listo, cancelé esa acción. Si quieres, te propongo otra opción.",
      action: null,
      intentLabel: "Cancelar acción",
      clearSuggestedAction: true,
    };
  }

  if (includesAny(normalized, CONFIRM_TERMS) && lastSuggestedAction) {
    return {
      response: `Perfecto, te llevo a ${lastSuggestedAction.label.toLowerCase()}.`,
      action: lastSuggestedAction,
      intentLabel: "Confirmación de acción",
      autoNavigate: true,
    };
  }

  const rankedNavRules = KEYWORD_NAV_RULES.map((rule) => {
    const keywordHits = rule.keywords.reduce(
      (acc, keyword) => acc + (normalized.includes(keyword) ? 1 : 0),
      0,
    );
    const routeBonus = getRoutePriorityBonus(pathname, rule.action?.path);
    return {
      rule,
      score: keywordHits + routeBonus,
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const matchedRule = rankedNavRules[0]?.rule || null;

  const matchedHowTo = HOWTO_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword)),
  );

  // Intenciones compuestas para frases naturales (ej: "quiero crear un formulario").
  if (includesAll(normalized, ["crear", "formulario"]) || includesAll(normalized, ["crear", "tramite"])) {
    return {
      response:
        "Claro. Para crear un formulario: 1) abre Formularios, 2) clic en 'Nuevo form', 3) define campos/secciones, 4) guarda/publica.",
      action: { label: "Ir a crear formulario", path: "/forms/new" },
      intentLabel: "Cómo crear formulario",
    };
  }

  if (includesAny(normalized, ["vecino", "ciudadano", "ciudadana"]) && includesAny(normalized, ["respuesta", "tramite", "expediente"])) {
    return {
      response:
        "Si quieres revisar gestión de trámites/expedientes del vecino, te conviene ir a Respuestas y filtrar por estado y fecha.",
      action: { label: "Ir a respuestas", path: "/submissions" },
      intentLabel: "Gestión de vecino",
    };
  }

  // Prioriza guías y acciones concretas antes que ayuda genérica.
  if (matchedHowTo) {
    return {
      response: matchedHowTo.response,
      action: matchedHowTo.action,
      intentLabel: matchedHowTo.action?.label || "Guía paso a paso",
    };
  }

  if (matchedRule) {
    return {
      response: pickVariant(matchedRule.responses, responseSeed),
      action: matchedRule.action,
      intentLabel: matchedRule.action?.label || "Navegación",
    };
  }

  if (normalized.includes("ayuda") || normalized.includes("como") || normalized.includes("como ")) {
    const helpText = HELP_BY_ROUTE[pathname] || HELP_BY_ROUTE["/"];
    return {
      response: `${helpText} Si quieres, también puedo llevarte directamente a otra sección.`,
      action: activeConfig.actions?.[0] || null,
      intentLabel: "Ayuda contextual",
    };
  }

  const fallbackAction = activeConfig.actions?.[0] || null;
  return {
    response:
      "No encontré una coincidencia exacta. Prueba con palabras clave como 'formularios', 'respuestas', 'usuarios', 'exportar' o 'auditoría'.",
    action: fallbackAction,
    intentLabel: "Sin coincidencia exacta",
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
  const [responseSeed, setResponseSeed] = useState(0);
  const [intentMemory, setIntentMemory] = useState([]);
  const [lastSuggestedAction, setLastSuggestedAction] = useState(null);
  const [lastIntentLabel, setLastIntentLabel] = useState("");

  const activeConfig = useMemo(() => getConfigForPath(location.pathname), [location.pathname]);

  const onActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const onSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    const result = resolveAssistantIntent(
      suggestion,
      location.pathname,
      activeConfig,
      responseSeed,
      { lastSuggestedAction, lastIntentLabel },
    );
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: suggestion },
      { role: "assistant", text: result.response },
    ]);
    const nextAction = result.clearSuggestedAction ? null : result.action;
    setPendingAction(nextAction);
    setLastSuggestedAction(nextAction);
    setLastIntentLabel(result.intentLabel || "");
    setResponseSeed((prev) => prev + 1);
    setIntentMemory((prev) => [result.intentLabel || "Sugerencia", ...prev].slice(0, 5));
    if (result.autoNavigate && result.action?.path) {
      onActionClick(result.action.path);
    }
  };

  const onSendQuestion = () => {
    const currentQuestion = question.trim();
    if (!currentQuestion) return;

    const result = resolveAssistantIntent(
      currentQuestion,
      location.pathname,
      activeConfig,
      responseSeed,
      { lastSuggestedAction, lastIntentLabel },
    );
    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: currentQuestion },
      { role: "assistant", text: result.response },
    ]);
    const nextAction = result.clearSuggestedAction ? null : result.action;
    setPendingAction(nextAction);
    setLastSuggestedAction(nextAction);
    setLastIntentLabel(result.intentLabel || "");
    setQuestion("");
    setResponseSeed((prev) => prev + 1);
    setIntentMemory((prev) => [result.intentLabel || "Consulta", ...prev].slice(0, 5));
    if (result.autoNavigate && result.action?.path) {
      onActionClick(result.action.path);
    }
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

            {intentMemory.length ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Memoria reciente</p>
                <div className="flex flex-wrap gap-2">
                  {intentMemory.map((intent, index) => (
                    <span
                      key={`${intent}-${index}`}
                      className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-[11px] text-slate-300"
                    >
                      {intent}
                    </span>
                  ))}
                </div>
                {lastIntentLabel ? (
                  <p className="text-[11px] text-slate-400">
                    Seguimiento: estábamos en <span className="text-slate-300">{lastIntentLabel}</span>.
                  </p>
                ) : null}
              </div>
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
