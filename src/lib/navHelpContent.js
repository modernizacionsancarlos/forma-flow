/**
 * Textos de ayuda para tooltips (ícono ℹ️) y menú contextual (clic derecho).
 * Claves alineadas con `navKey` del sidebar y secciones del layout.
 */
export const NAV_HELP = {
  general: {
    tooltip: "Panel principal de FormaFlow: menú lateral, notificaciones y área de trabajo.",
    what: "FormaFlow es la consola de gestión municipal multi-empresa: formularios, trámites, usuarios y auditoría en un solo lugar.",
    purpose: "Centralizar el trabajo diario del personal y mantener trazabilidad de lo que ocurre en el sistema.",
    how: "Usá el menú izquierdo para cambiar de módulo. La campana muestra avisos recientes. El clic derecho abre ayuda contextual sobre la zona.",
  },
  dashboard: {
    tooltip: "Resumen y métricas generales de tu ámbito.",
    what: "El tablero muestra indicadores y accesos rápidos según tu rol y permisos.",
    purpose: "Tener una vista panorámica del estado del sistema sin entrar aún a cada módulo.",
    how: "Revisá tarjetas y enlaces rápidos; desde acá podés saltar a formularios o respuestas frecuentes.",
  },
  forms: {
    tooltip: "Diseño y listado de formularios de recolección de datos.",
    what: "Los formularios definen qué datos se piden al ciudadano o al interno y cómo se validan.",
    purpose: "Crear y mantener los instrumentos digitales de cada trámite o encuesta.",
    how: "Creá uno nuevo, editá campos y publicá cuando esté listo. Los envíos aparecen en Respuestas.",
  },
  submissions: {
    tooltip: "Trámites y envíos recibidos desde formularios.",
    what: "Cada fila es un trámite con su estado, datos capturados e historial.",
    purpose: "Gestionar la cola operativa: revisar, cambiar estado y dar seguimiento.",
    how: "Filtrá por estado o fechas, abrí un trámite y usá las acciones permitidas por tu rol.",
  },
  areas: {
    tooltip: "Áreas o dependencias dentro de la estructura municipal.",
    what: "Las áreas organizan formularios, permisos y responsables por sector.",
    purpose: "Reflejar la orgánica real para asignar trabajo y reportes.",
    how: "Creá o editá áreas y vinculá usuarios según la política de tu municipio.",
  },
  empresas: {
    tooltip: "Empresas o tenants (espacios aislados de datos).",
    what: "Cada empresa es un contenedor de formularios, usuarios y trámites propios.",
    purpose: "Operar en modo multi-tenant sin mezclar información entre organizaciones.",
    how: "Altas y ajustes suelen ser tarea de Super Admin o Admin según permisos.",
  },
  usuarios: {
    tooltip: "Usuarios del personal, roles, invitaciones y permisos.",
    what: "Acá se administran cuentas de staff, invitaciones y la matriz de permisos por rol o usuario.",
    purpose: "Controlar quién puede ver y hacer qué en cada módulo.",
    how: "Invitá, editá perfiles, ajustá permisos en la pestaña correspondiente y respondé solicitudes que lleguen por notificación.",
  },
  admin_panel: {
    tooltip: "Herramientas avanzadas de la plataforma.",
    what: "Panel técnico y de configuración profunda según lo habilitado en tu instalación.",
    purpose: "Operaciones que no son del día a día pero son necesarias para mantener FormaFlow.",
    how: "Solo para roles con permiso explícito; cada sección indica el alcance.",
  },
  observatory: {
    tooltip: "Monitoreo y salud operativa.",
    what: "Vista para supervisar picos de actividad, errores o señales de uso.",
    purpose: "Detectar problemas antes de que impacten a ciudadanos o personal.",
    how: "Revisá métricas y seguí los enlaces de detalle cuando existan.",
  },
  workflows: {
    tooltip: "Automatización por reglas entre estados o acciones.",
    what: "Los workflows encadenan pasos cuando un trámite cambia de estado u ocurre un evento.",
    purpose: "Reducir trabajo manual repetitivo y estandarizar el circuito.",
    how: "Definí reglas con cuidado y probá en un tenant de prueba si está disponible.",
  },
  exports: {
    tooltip: "Descarga de datos en archivos.",
    what: "Generación de exportaciones (CSV, Excel u otros formatos configurados).",
    purpose: "Llevar datos a auditorías, BI o sistemas externos.",
    how: "Elegí rango y tipo de datos; esperá la generación y descargá el archivo.",
  },
  audit: {
    tooltip: "Registro de acciones relevantes para auditoría.",
    what: "Historial de quién hizo qué y cuándo, según lo que la app registra.",
    purpose: "Cumplir trazabilidad y resolver incidencias.",
    how: "Filtrá por fecha, usuario o acción y exportá si tu rol lo permite.",
  },
  sync: {
    tooltip: "Sincronización con sistemas externos o tareas masivas.",
    what: "Operaciones para alinear datos entre FormaFlow y otras fuentes.",
    purpose: "Mantener consistencia cuando hay integraciones.",
    how: "Seguí los asistentes del módulo; suelen requerir permisos elevados.",
  },
  settings: {
    tooltip: "Preferencias de la app y datos de marca.",
    what: "Logo, colores y parámetros generales visibles para los usuarios.",
    purpose: "Adaptar FormaFlow a la identidad institucional.",
    how: "Editá y guardá; algunos cambios se reflejan al instante en la interfaz.",
  },
  notifications: {
    tooltip: "Centro de notificaciones in-app.",
    what: "Avisos generados por el sistema: trámites, solicitudes de permisos, activaciones, etc.",
    purpose: "No perder eventos que requieren acción del personal.",
    how: "Clic para abrir la lista; tocá una fila para marcarla como leída. El número rojo indica pendientes.",
  },
  logout: {
    tooltip: "Cierra tu sesión en este dispositivo.",
    what: "Termina la sesión de Firebase Auth y limpia el contexto local de usuario.",
    purpose: "Proteger datos cuando dejás la estación desatendida.",
    how: "Hacé clic en Cerrar sesión; volverás a la pantalla de ingreso.",
  },
};
