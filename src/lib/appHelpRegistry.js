/**
 * Ayuda contextual: ℹ️ y clic derecho.
 * Resolve por prefijo (`forms.preview` → `forms` → `general`).
 */

export const HELP_REGISTRY = {
  general: {
    tooltip: "FormaFlow — gestión municipal y trámites digitales.",
    what: "Plataforma de formularios, respuestas, usuarios multi-tenant y auditoría.",
    purpose: "Trabajar ordenado con trazabilidad entre equipos.",
    how: "Usá los íconos ℹ️ y el clic derecho sobre zonas marcadas (no sobre campos de texto).",
  },

  dashboard: {
    tooltip: "Panel resumen.",
    what: "KPI y accesos rápidos según tu rol.",
    purpose: "Ver el estado general sin entrar a cada módulo.",
    how: "Navegá tarjetas, tabla reciente y atajos laterales.",
  },
  forms: {
    tooltip: "Listado de formularios.",
    what: "Diseños digitales para capturar datos de trámites o encuestas.",
    purpose: "Crear y mantener instrumentos activos.",
    how: "Buscá, filtrá, editá por fila o creá uno nuevo.",
  },
  submissions: {
    tooltip: "Trámites / respuestas recibidas.",
    what: "Cada ítem tiene estado y datos cargados.",
    purpose: "Gestionar la cola operativa.",
    how: "Usá filtros y acciones sobre cada expediente.",
  },
  areas: {
    tooltip: "Áreas o dependencias.",
    what: "Estructuran responsables por sector municipal.",
    purpose: "Asignación y reportes alineados a la organigrama.",
    how: "Alta o edición de áreas disponibles.",
  },
  empresas: {
    tooltip: "Empresas / tenants.",
    what: "Cada empresa aísla formularios, usuarios y trámites.",
    purpose: "Operar sin mezclar datos entre organizaciones.",
    how: "ABM típico de Super Admin / Admin autorizado.",
  },
  usuarios: {
    tooltip: "Usuarios staff, roles e invitaciones.",
    what: "Cuentas del personal municipal y permisos.",
    purpose: "Controlar accesos a cada vista y función.",
    how: "Invitaciones, estado de cuenta, pestaña Permisos.",
  },
  admin_panel: {
    tooltip: "Panel avanzado de plataforma.",
    what: "Herramientas técnicas o masivas.",
    purpose: "Mantener funcionalidades centrales.",
    how: "Solo con permiso; cada pestaña lleva ayuda contextual.",
  },
  observatory: {
    tooltip: "Observatorio / monitoreo.",
    what: "Vista de KPIs operativos o infraestructura.",
    purpose: "Anticipar incidencias o cuellos de botella.",
    how: "Cambiar rango y refrescar según filtros disponibles.",
  },
  workflows: {
    tooltip: "Workflows automatizados.",
    what: "Reglas ante cambios de estado o eventos.",
    purpose: "Reducir trabajo manual repetitivo.",
    how: "Definí condiciones ordenadas probando en entorno controlado.",
  },
  exports: {
    tooltip: "Exportaciones a archivo.",
    what: "Generación de extracts de datos.",
    purpose: "Auditoría, estadística o uso externo.",
    how: "Elegí rango/formato/plantilla permitida.",
  },
  audit: {
    tooltip: "Auditoría y registro de acciones.",
    what: "Quién hizo qué y cuándo, según lo registrado.",
    purpose: "Cumplimiento y resolución de incidencias.",
    how: "Filtrado por período y tipo de evento cuando exista.",
  },
  sync: {
    tooltip: "Sincronización o integraciones.",
    what: "Movimiento de datos hacia/desde otros sistemas.",
    purpose: "Mantener coherencia institucional.",
    how: "Seguí procesos definidos solo con usuarios autorizados.",
  },
  settings: {
    tooltip: "Configuración y marca institucional.",
    what: "Logo, colores y opciones globales visibles.",
    purpose: "Apariencia coherente con el municipio.",
    how: "Guardá después de cada bloque importante.",
  },
  notifications: {
    tooltip: "Centro de notificaciones.",
    what: "Avisos de sistema: permisos, activaciones, actualizaciones.",
    purpose: "No perder tareas pendientes del equipo.",
    how: "Abrí la campana y tocá cada aviso si conviene marcarlo leído.",
  },
  logout: {
    tooltip: "Cerrar sesión en este equipo.",
    what: "Termina la sesión de autenticación actual.",
    purpose: "Proteger datos si abandonás la estación.",
    how: "Volverás al inicio de sesión.",
  },

  login: {
    tooltip: "Pantalla de ingreso.",
    what: "Autenticación con correo y contraseña otorgados por el municipio.",
    purpose: "Solo personal dado de alta.",
    how: "Si venís por invitación, usá exactamente ese correo.",
  },
  "login.submit": {
    tooltip: "Validar usuario y contraseña.",
    what: "Se consulta contra el servicio seguro Firebase Auth.",
    purpose: "Obtener acceso válido al panel.",
    how: "Completá email y contraseña y esperá confirmación.",
  },
  "login.email": {
    tooltip: "Correo institucional asignado al personal.",
    what: "Usuario único en Firebase Auth; suele ser municipalidad.gob.",
    purpose: "Identificar la persona sin ambigüedad.",
    how: "Usuario minúsculas exactos a la invitación si aplica.",
  },
  "login.password": {
    tooltip: "Clave temporal o definitiva otorgada.",
    what: "Se valida de forma cifrada contra el proveedor de identidad.",
    purpose: "Evitar accesos no autorizados.",
    how: "Si olvidás la clave, solicitá restablecimiento vía administración.",
  },

  // Dashboard granular (resuelven por sufijo hasta `dash.*` luego dashboard)
  "dash.kpi": {
    tooltip: "Indicador clickeable.",
    what: "Cuentas agregadas del sistema según tus permisos.",
    purpose: "Entrar rápido al módulo relacionado desde el número.",
    how: "Clic en la tarjeta lleva la ruta asociada.",
  },
  "dash.recentSubs": {
    tooltip: "Tabla de últimas respuestas.",
    what: "Muestra tramites ordenados desde lo más nuevo.",
    purpose: "Volumen actual de trabajo entrante.",
    how: "Usá Ver todas para el listado completo.",
  },
  "dash.quick": {
    tooltip: "Atajos a módulos frecuentes.",
    what: "Seis rutas rápidas con icono etiquetado.",
    purpose: "Reducir clics rutinarios del equipo.",
    how: "Cada mosaico abre una sección específica.",
  },
  "dash.activity": {
    tooltip: "Actividad reciente resumida.",
    what: "Últimos eventos grabados tipo bitácora.",
    purpose: "Conciencia de cambios equipo.",
    how: "Detalle profundo disponible en Auditoría.",
  },
  "dash.tenantTable": {
    tooltip: "Listado instituciones (Super Admin).",
    what: "Empresas/tenants con plan y estado.",
    purpose: "Gobernanza del universo de clientes municipales.",
    how: "Mantenimiento desde el módulo Empresas.",
  },

  "forms.new": {
    tooltip: "Crear nuevo formulario.",
    what: "Abre el constructor con plantilla inicial vacía.",
    purpose: "Diseñar un instrumento nuevo de captación.",
    how: "Asigná campos, empresa y público según necesidad.",
  },
  "forms.preview": {
    tooltip: "Vista previa pública/interna.",
    what: "Render igual verá ciudadano antes de responder.",
    purpose: "Validar textos obligatorios y layout.",
    how: "Cerrar modal y aplicar cambios si falta algo.",
  },
  "forms.copyLink": {
    tooltip: "Copiar URL del formulario.",
    what: "Enlace público/absoluto al trámite digital.",
    purpose: "Enviarlo por WhatsApp/chat/ciudad.",
    how: "Pegar donde necesites después de autorización.",
  },
  "forms.archive": {
    tooltip: "Archivar formulario.",
    what: "Lo saca del uso activo en listados principales.",
    purpose: "Cerrar ciclo cuando ya no aplica responder.",
    how: "Puede rehabilitarse desde edición.",
  },
  "forms.delete": {
    tooltip: "Eliminar formulario del sistema.",
    what: "Borra plantilla configurada (impacta estadística).",
    purpose: "Limpieza controlada ante duplicidades.",
    how: "Solo usuarios autorizados; confirmá diálogo.",
  },
  "forms.responseLimit": {
    tooltip: "Límite temporal o por cantidad de respuestas.",
    what: "Condiciona hasta cuántas o hasta cuándo se acepta.",
    purpose: "Campañas acotadas o cupos institucionales.",
    how: "Definís reglas dentro del modal de límite.",
  },
  "forms.edit": {
    tooltip: "Ir al constructor para modificar campos y publicación.",
    what: "Editor avanzado por secciones o esquema legacy.",
    purpose: "Adaptar el instrumento a política vigente.",
    how: "Guardá versiones; revisá vista previa antes de publicar cambios sensibles.",
  },
  "forms.row": {
    tooltip: "Tarjeta de formulario y acciones de fila.",
    what: "Incluye estado, empresa, visibilidad y accesos.",
    purpose: "Administrar formularios sin abrir el constructor completo hasta que haga falta.",
    how: "Usá copiar enlace, límites y fila inferior (editar / previa / archivar / borrar).",
  },
  "forms.toggle": {
    tooltip: "Permutar opción rápida del formulario.",
    what: "Activa/desactiva un flag configurado compacto.",
    purpose: "Ajustar sin pantalla grande.",
    how: "Clic alterna valores visibles estado color.",
  },
  "forms.filter": {
    tooltip: "Filtros de listado.",
    what: "Texto empresa estado para acotar filas.",
    purpose: "Trabajar con subconjunto manejable.",
    how: "Combinación buscadora selects.",
  },

  "empresas.new": {
    tooltip: "Alta empresa/tenant nueva.",
    what: "Crea espacio aislado con sus propios usuarios y trámites.",
    purpose: "Incorporar organismo nuevo al sistema municipal.",
    how: "Completá formulario modal y guardá desde pie del diálogo.",
  },
  "areas.new": {
    tooltip: "Nueva área dentro de empresa.",
    what: "Unidad organizativa para reportes y asignaciones.",
    purpose: "Reflejar estructura física/virtual municipio.",
    how: "Elegís empresa vínculos responsables antes guardar.",
  },
  "subs.sidebar": {
    tooltip: "Selector de formulario en vista Respuestas.",
    what: "Filtra tabla principal según cada instrumento cargado.",
    purpose: "Trabajar módulos distintos sin mezclar expedientes.",
    how: "Clic en elemento lista izquierda; contador muestra volumen snapshot.",
  },
  "subs.refresh": {
    tooltip: "Forzar lectura remota servidor Firestore.",
    what: "Vueltra consulta sin depender sólo snapshots locales necesaria.",
    purpose: "Garantías frescura datos coordinación equipo.",
    how: "Clic esperá spinner finalizar aparecer toast si error.",
  },
  "subs.filters": {
    tooltip: "Filtros de trámites.",
    what: "Fecha empresa estado texto libre tabla.",
    purpose: "Narrow operación diaria equipo.",
    how: "Abrir cerrar drawer filtros combinando criterios.",
  },
  "subs.delete": {
    tooltip: "Eliminar tramite/expediente.",
    what: "Quita archivo submission Firestore conforme política municipal.",
    purpose: "Error duplic GDPR ventana muy limitada instituciones.",
    how: "Solo roles según matriz seguridad municipal.",
  },
  "subs.bulk": {
    tooltip: "Acciones multiples filas tramites seleccionadas.",
    what: "Ahorra clicks repetición uniforme trabajo.",
    purpose: "Cambiar estado/export parcial equipo.",
    how: "Marcar selección encabez tabla acción barra contextual.",
  },

  config: {
    tooltip: "Bloques parámetro sistema.",
    what: "Branding comunicación seguridad otros toggles instituciones.",
    purpose: "Ajuste global experiencia equipo ciudadano cuando visible.",
    how: "Cada pestaña archivo separado dentro pantalla etiqueta contextual.",
  },
  citizen: {
    tooltip: "Portal seguimiento tramite público ciudadano persona.",
    what: "Ingres código referencia proporcion tramite físico/email.",
    purpose: "Transparencia tramite ciudad frente escritorio.",
    how: "Proteccion campos seguridad ciudadano mismo.",
  },
  admin: {
    tooltip: "Secciones técnicos plataforma operador experimentado.",
    what: "Cada pestaña panel admin destino recurso infra.",
    purpose: "Mantenimiento parametrizaciones avanzadas.",
    how: "Seleccioná fichas explorá ℹ️ acción granular.",
  },
  globalMonitor: {
    tooltip: "Indicadores near-real-time infra operaciones.",
    what: "Graf tiempo peticiones estado integraciones ciudad.",
    purpose: "NOC municipal detectar problema tempranos.",
    how: "Ajust fecha interval refresh manual.",
  },
  syncPage: {
    tooltip: "Sinc cron conciliadores externos registros instituciones.",
    what: "Botones lanzan proceso async seguro.",
    purpose: "Alinear dataset legacy.",
    how: "Solo ejecutar proceso document oficial.",
  },
  "usuarios.invite": {
    tooltip: "Invitación por correo (Firebase).",
    what: "Genera invitación pendiente y correo con enlace de contraseña.",
    purpose: "Dar de alta personas sin contraseña inicial manual.",
    how: "Completa datos; el invitado debe aceptar tras iniciar sesión.",
  },
  "usuarios.create": {
    tooltip: "Creación directa de usuario y perfil.",
    what: "Provisiona Auth + userProfiles y dispara correo de acceso.",
    purpose: "Casos donde necesitás alta inmediata supervisada.",
    how: "Empresa y rol obligatorios.",
  },
  "usuarios.tab": {
    tooltip: "Alternar vista del módulo Usuarios.",
    what: "Lista operativa, matriz de permisos o archivados.",
    purpose: "Aislar tareas de RRHH vs permisos avanzados.",
    how: "Clic en la pestaña correspondiente.",
  },
  "usuarios.permissionsIntro": {
    tooltip: "Editor estilo matriz de permisos.",
    what: "Plantillas por rol y excepciones por usuario.",
    purpose: "Ajustar vistas/acciones tipo Django admin.",
    how: "Guardá y usá vista previa sin impacto hasta confirmar.",
  },
  "usuarios.row": {
    tooltip: "Acciones sobre un usuario de la tabla.",
    what: "Ver datos, permisos, reenviar invite, activar/archivar/eliminar.",
    purpose: "Ciclo de vida de cuentas municipales.",
    how: "Botones dependen del estado (pendiente vs activo vs archivado).",
  },
  "usuarios.modal": {
    tooltip: "Formulario alta/edición usuario.",
    what: "Nombre, correo, empresa, rol y áreas opcionales.",
    purpose: "Mantener datos alineados Auth + Firestore.",
    how: "Cancelar descarta; guardar valida email y tenant.",
  },

  publicForm: {
    tooltip: "Formulario electrónico accesible público ciudadano empresa.",
    what: "Incluye campo adjuntos validadores.",
    purpose: "Obtiene datos ciudadano oficial.",
    how: "Revis antes enviar porque cambios pueden exigir reabrir soporte ciudadano persona.",
  },
  errors: {
    tooltip: "Pantalla error sistema.",
    what: "Mensaje instituciones ayuda soporte equipo.",
    purpose: "No dejar página blanca confusión.",
    how: "Recarg recomend soporte tecnico instituciones.",
  },
};

export function resolveHelp(sectionKey) {
  if (!sectionKey || typeof sectionKey !== "string") return HELP_REGISTRY.general;
  let k = sectionKey.trim();
  while (k) {
    if (HELP_REGISTRY[k]) return HELP_REGISTRY[k];
    const i = k.lastIndexOf(".");
    if (i <= 0) break;
    k = k.slice(0, i);
  }
  switch (sectionKey.split(".")[0]) {
    case "forms":
      return HELP_REGISTRY.forms;
    case "subs":
      return HELP_REGISTRY.submissions;
    case "dash":
      return HELP_REGISTRY.dashboard;
    case "usuarios":
      return HELP_REGISTRY.usuarios;
    case "login":
      return HELP_REGISTRY.login;
    case "empresas":
      return HELP_REGISTRY.empresas;
    case "areas":
      return HELP_REGISTRY.areas;
    default:
      return HELP_REGISTRY.general;
  }
}

export const NAV_HELP = HELP_REGISTRY;
