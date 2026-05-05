/**
 * Ayuda contextual: ℹ️ y clic derecho.
 * Resolve por prefijo (`forms.preview` → `forms` → `general`).
 */

export const HELP_REGISTRY = {
  general: {
    tooltip: "FormaFlow — gestión municipal y trámites digitales.",
    what: `FormaFlow es la aplicación institucional para digitalizar formularios, respuestas y la gestión de equipos. En un solo lugar reunís:

- Formularios y trámites en línea
- Seguimiento de expedientes y estados operativos
- Usuarios, permisos y empresas o áreas municipales
- Auditoría y reportes según el rol asignado`,
    purpose: `Reducir papeles, ordenar el trabajo entre áreas y dejar trazabilidad clara de quién hizo cada acción. Cada persona ve solo lo que corresponde a su rol y permisos.`,
    how: `Tres formas de obtener ayuda en cualquier pantalla:

1. Ícono pequeño “i” (ℹ️): dejá el puntero encima para leer una explicación breve sin abrir ventanas nuevas.

2. Clic derecho en fondos, tarjetas o bloques señalados: se abre un menú con tres niveles — qué es, para qué sirve y guía detallada de uso.

3. En campos donde escribís texto puede aparecer el menú del navegador: es normal; escribí con tranquilidad.

4. Si en Configuración desactivaste los íconos ℹ️ para tu usuario, seguirán funcionando el clic derecho y los textos del menú; la preferencia viaja con tu cuenta, no con el PC.`,
  },

  dashboard: {
    tooltip: "Panel resumen.",
    what: `El tablero principal resume números clave, movimiento reciente y atajos hacia los módulos que usás con más frecuencia. El contenido exacto depende de tu rol: no todos ven las mismas tarjetas.`,
    purpose: `Entrar y en pocos segundos entender si hay trabajo nuevo, expedientes recientes o alertas que deban atenderse antes de abrir cada sección.`,
    how: `Cómo usarlo día a día:

1. Revisá las tarjetas superiores (KPI): muchas son enlaces directos a la lista relacionada.

2. La tabla de trámites recientes resume lo último que ingresó: podés saltar al detalle o abrir “Ver todas” para el listado completo.

3. Los mosaitos de accesos rápidos llevan a Formularios, Respuestas, Usuarios u otras rutas según permisos.

4. El bloque de actividad es un resumen; para análisis profundo usá Auditoría si tu rol lo permite.`,
  },
  forms: {
    tooltip: "Listado de formularios.",
    what: `Aquí se administran los formularios digitales: borradores, publicados, archivados y su relación con la empresa o trámite que corresponda.`,
    purpose: `Crear, ajustar y mantener los instrumentos mediante los cuales el ciudadano o el equipo interno cargan datos oficiales.`,
    how: `Flujo habitual:

1. Buscá o filtrá por nombre, empresa o estado para encontrar el formulario.

2. Cada fila ofrece acciones: vista previa, editar en el constructor, copiar enlace público, límites, archivar o eliminar según permisos.

3. El botón de alta abre un formulario nuevo en blanco o desde plantilla.

4. Antes de cambios sensibles (archivar, borrar), confirmá en el diálogo y avisá al equipo si el trámite sigue vigente para el público.`,
  },
  submissions: {
    tooltip: "Trámites / respuestas recibidas.",
    what: `Listado operativo de cada respuesta o expediente cargado contra un formulario. Ves estado, fechas, usuario cuando aplique y acciones según tu rol.`,
    purpose: `Procesar la cola de trabajo: filtrar, revisar detalle, cambiar estado o exportar sin perder el hilo de lo pendiente.`,
    how: `Guía de uso:

1. Elegí el formulario en la columna izquierda para acotar la lista principal.

2. Usá “Recargar” si necesitás datos recién cargados por otra persona.

3. Abrí “Filtros” para combinar fechas, texto libre o estado y reducir el volumen a lo que estás tratando ahora.

4. En cada fila o detalle seguirán las acciones permitidas (ver, firmar, eliminar, etc.) según la matriz municipal.`,
  },
  areas: {
    tooltip: "Áreas o dependencias.",
    what: `Unidades organizativas (secretarías, direcciones, oficinas) usadas para asignar formularios, usuarios y reportes según la estructura real del municipio.`,
    purpose: `Ordenar responsabilidades y filtros sin mezclar lo que corresponde a otra dependencia.`,
    how: `Uso habitual:

1. Alta o edición desde el listado o modal según pantalla; completá nombre y vínculos que pida el municipio.

2. Asociá usuarios al área correcta para que los permisos y las bandejas tengan sentido operativo.

3. Si no ves el botón de alta, tu rol puede estar limitado a consulta.

4. Usá el clic derecho en el bloque para la guía larga del módulo Áreas.`,
  },
  empresas: {
    tooltip: "Empresas / tenants.",
    what: `Cada empresa o tenant es un espacio de datos aislado: formularios, usuarios y trámites no se mezclan entre organizaciones cargadas en el mismo proyecto.`,
    purpose: `Permitir que distintos entes o reparticiones usen la misma plataforma sin cruzar información sensible.`,
    how: `Pautas:

1. El alta suele estar restringida a perfiles de administración central o municipal.

2. Antes de crear una empresa nueva, confirmá que no exista ya homónima.

3. Tras crear, configurá áreas y usuarios dentro de ese tenant.

4. Las acciones por fila suelen incluir acceso a usuarios filtrados o edición según política.`,
  },
  usuarios: {
    tooltip: "Usuarios staff, roles e invitaciones.",
    what: `Gestión de cuentas del personal: altas por invitación o creación directa, estado (activo, pendiente, archivado) y permisos efectivos por rol o excepciones por persona.`,
    purpose: `Garantizar que solo quien debe ver o editar un trámite tenga acceso, y poder auditar cambios de permisos cuando la política municipal lo exija.`,
    how: `Pasos recomendados:

1. Pestaña “Lista de usuarios”: invitar, crear, buscar y actuar por fila (ver, permisos, reenviar correo, activar o archivar).

2. Pestaña “Permisos”: matriz por rol y ajustes finos por usuario; guardá y usá vista previa donde exista.

3. Pestaña “Archivados”: recuperar o borrar definitivamente según política.

4. Cada acción sensible suele pedir confirmación; revisá el correo institucional del usuario antes de crear o invitar.`,
  },
  admin_panel: {
    tooltip: "Panel avanzado de plataforma.",
    what: `Herramientas técnicas, métricas globales o acciones masivas reservadas a operadores con rol adecuado; el contenido varía según lo desplegado en tu entorno.`,
    purpose: `Mantener la plataforma estable, diagnosticar problemas y ejecutar tareas que no deben estar en manos de todo el personal.`,
    how: `Reglas de oro:

1. No ejecutes acciones masivas sin entender el alcance y sin avisar al responsable.

2. Cada pestaña o tarjeta puede tener ayuda propia con clic derecho.

3. Anotá qué cambiaste y cuándo para poder revertir o explicar en auditoría.

4. Si algo parece fuera de tu competencia, detenete y escalá a sistemas.`,
  },
  observatory: {
    tooltip: "Observatorio / monitoreo.",
    what: `Pantalla de indicadores en tiempo casi real: puede incluir peticiones, tiempos de respuesta, colas o estado de integraciones según lo configurado.`,
    purpose: `Detectar antes que el usuario final note lentitud, errores o picos de uso.`,
    how: `Cómo leerla:

1. Ajustá el rango temporal si hay selector; los picos suelen alinearse con horarios de oficina.

2. Usá “refrescar” o equivalente tras cambios importantes en infraestructura.

3. No interpretes un solo valor aislado: cruzá con Auditoría o logs si hace falta.

4. Capturas de pantalla ayudan al equipo de soporte si abrís un ticket.`,
  },
  workflows: {
    tooltip: "Workflows automatizados.",
    what: `Definición de reglas que reaccionan cuando un trámite cambia de estado, llega a un responsable o se cumple una condición (por ejemplo notificaciones o derivaciones).`,
    purpose: `Automatizar pasos repetitivos para que el equipo no tenga que recordar cada movimiento manualmente.`,
    how: `Guía general:

1. Revisá en qué estado “escucha” cada regla y qué produce (correo, cambio de estado, tarea).

2. Probá primero con trámites de prueba o en horario de bajo impacto.

3. Documentá en tu área qué flujos están activos para no duplicar lógica.

4. Si algo no dispara, verificá permisos y que el trámite cumpla todas las precondiciones.`,
  },
  exports: {
    tooltip: "Exportaciones a archivo.",
    what: `Generación de archivos (hojas de cálculo, CSV u otros formatos según lo habilitado) a partir de respuestas o conjuntos filtrados.`,
    purpose: `Permitir auditoría externa, informes estadísticos o trabajo en Excel sin exponer la base completa.`,
    how: `Recomendaciones:

1. Acotá siempre por fechas o filtros para no descargar más datos de los necesarios.

2. Guardá los archivos en ubicaciones institucionales seguras, no en equipos personales sin criterio.

3. Si el export falla por tamaño, refiná el filtro o pedí ayuda a sistemas.

4. Los íconos ℹ️ en cada control explican columnas o formatos cuando existan.`,
  },
  audit: {
    tooltip: "Auditoría y registro de acciones.",
    what: `Registro de eventos relevantes: quién ejecutó una acción, sobre qué entidad y en qué momento, según lo que la aplicación pueda registrar.`,
    purpose: `Dar trazabilidad ante reclamos, controles internos o pedidos de información.`,
    how: `Modo de uso:

1. Usá búsqueda y filtros por fecha o texto para acotar resultados.

2. Interpretá cada línea como evidencia operativa, no como valor legal por sí sola: cruzá con el trámite en Respuestas si hace falta.

3. Exportá o copiá datos solo según normativa de protección de datos personales.

4. Si el listado está vacío, puede ser falta de permisos o de eventos en el rango elegido.`,
  },
  sync: {
    tooltip: "Sincronización o integraciones.",
    what: `Procesos que mueven o alinean datos entre FormaFlow y otros sistemas del municipio (legados, ERP externos, etc.) cuando está habilitado.`,
    purpose: `Evitar doble carga manual y mantener consistencia entre applications.`,
    how: `Precauciones:

1. Ejecutá procesos masivos solo si conocés el impacto y fuiste capacitado.

2. Leé los mensajes al finalizar: suelen indicar registros correctos o fallidos.

3. No interrumpas una sincronización a mitad salvo instrucción expresa de sistemas.

4. El clic derecho en esta pantalla detalla cada bloque según lo implementado en tu municipio.`,
  },
  settings: {
    tooltip: "Configuración y preferencias de tu cuenta.",
    what: `En Configuración reunís opciones de idioma, formato de fecha, zona horaria, preferencias de vista y marca (en la pestaña Apariencia). Parte se guarda solo en este navegador y parte en tu perfil de usuario en la nube.`,
    purpose: `Adaptar la experiencia del panel al idioma y hábitos de trabajo sin afectar a otros usuarios de la institución.`,
    how: `Buenas prácticas:

1. Guardá al final de cada bloque para no perder cambios.

2. La pestaña General incluye preferencias de cuenta (como los íconos de ayuda) que siguen a tu usuario en cualquier equipo.

3. La pestaña Apariencia suele usar almacenamiento local del navegador para logo/colores rápidos en tu equipo.

4. Si algo no se aplicó, revisá que hayas guardado y recargá la página una vez.`,
  },

  "settings.helpIcons": {
    tooltip: "Mostrar u ocultar los íconos ℹ️ en toda la aplicación.",
    what: `Esta preferencia afecta únicamente los íconos circulares de información que aparecen junto a títulos, botones y acciones en el panel. No desactiva el menú de ayuda del clic derecho ni los textos dentro de ese menú.`,
    purpose: `Algunas personas prefieren pantallas más limpias; otras quieren las pistas siempre a la vista. Podés alternar cuando quieras sin depender del administrador de sistemas.`,
    how: `Comportamiento:

1. Activado (predeterminado): ves el símbolo ℹ️ donde haya texto de ayuda cargado.

2. Desactivado: los íconos ya no ocupan espacio visual; la ayuda detallada sigue disponible haciendo clic derecho sobre el mismo bloque (¿Qué es?, ¿Para qué sirve?, ¿Cómo se usa?).

3. Se guarda en tu documento de perfil (Firestore), identificado por tu correo: mismo comportamiento en cualquier dispositivo donde inicies sesión.

4. Si no ves el cambio al instante, esperá un segundo o recargá la página; la app sincroniza el valor en vivo.`,
  },
  notifications: {
    tooltip: "Centro de notificaciones.",
    what: `Listado de avisos del sistema: altas de usuarios, cambios de permisos, recordatorios operativos o mensajes de la plataforma según lo habilitado en tu entorno.`,
    purpose: `Enterarte sin recargar cada pantalla y marcar como leído lo que ya atendiste.`,
    how: `Pasos:

1. Abrí el icono de campana; el número indica pendientes no leídos.

2. Tocá un aviso para ver detalle o la acción sugerida.

3. Si tu instalación lo permite, marcá como leído para bajar el contador.

4. Los avisos no reemplazan el correo oficial del municipio cuando la política lo exija por escrito.`,
  },
  logout: {
    tooltip: "Cerrar sesión en este equipo.",
    what: `Cierra la sesión de Firebase en este navegador; se invalida el token local y debés volver a autenticarte para usar el panel.`,
    purpose: `Evitar que otra persona que llegue a la misma PC acceda a trámites sensibles con tu identidad.`,
    how: `Cuándo usarlo:

1. Siempre al terminar en una computadora compartida o de atención al público.

2. No sustituye “borrar historial”; solo corta la sesión en esta app.

3. Tras cerrar, verás la pantalla de login.

4. Si tu municipio exige también bloqueo de Windows, hacelo aparte.`,
  },

  login: {
    tooltip: "Pantalla de ingreso.",
    what: `Inicio de sesión con el correo y la contraseña que te asignó el municipio o que definiste tras la invitación. El sistema valida contra Firebase Authentication de forma cifrada.`,
    purpose: `Solo el personal autorizado entra al panel interno; se evita el acceso anónimo a datos institucionales.`,
    how: `Pasos:

1. Escribí el correo completo (ej. nombre@municipio.gob.ar) tal como figura en la invitación o en el alta.

2. Ingresá la contraseña con mayúsculas y símbolos exactos.

3. Si falla varias veces, frená y pedí restablecimiento o revisión de cuenta a quien administra usuarios.

4. Los íconos ℹ️ en esta pantalla explican cada campo sin salir del formulario.`,
  },
  "login.submit": {
    tooltip: "Validar usuario y contraseña.",
    what: `Botón que envía correo y clave al servicio de autenticación seguro; si son correctos, se crea la sesión y te redirige al panel según tus permisos.`,
    purpose: `Iniciar sesión solo cuando las credenciales coinciden con un usuario activo en el proyecto.`,
    how: `Qué hacer:

1. Completá correo y contraseña antes de pulsar.

2. Esperá el mensaje de éxito o error; no hagas doble clic rápido para evitar bloqueos temporales.

3. Si ves error genérico, verificá teclas mayúsculas y correo sin espacios al inicio o al final.

4. Tras entrar, tu preferencia de íconos de ayuda (si la configuraste) se aplica automáticamente.`,
  },
  "login.email": {
    tooltip: "Correo institucional asignado al personal.",
    what: `Campo de texto donde va tu dirección de correo única registrada en Firebase. Suele ser la oficial del municipio o la que te enviaron en la invitación.`,
    purpose: `Identificar sin ambigüedad a la persona humana detrás de la cuenta.`,
    how: `Consejos:

1. Copiá y pegá el correo si te lo dieron por escrito para no equivocar letras.

2. El sistema suele ser sensible a mayúsculas/minúsculas en el dominio: usá el formato oficial.

3. Si cambiaste de apellido y el correo aún no está actualizado en sistemas, usá el que tiene el administrador hasta que migren la cuenta.`,
  },
  "login.password": {
    tooltip: "Clave temporal o definitiva otorgada.",
    what: `Campo enmascarado donde se escribe la contraseña; no se muestra en pantalla ni se guarda en texto plano en el navegador.`,
    purpose: `Probar que quien ingresa conoce un secreto compartido solo con la institución, cumpliendo políticas mínimas de seguridad.`,
    how: `Buenas prácticas:

1. No reutilices la clave de tu correo personal para cuentas municipales.

2. Si te dieron una temporal, cambiála cuando el flujo lo indique.

3. Si olvidaste la clave, pedí restablecimiento por el canal oficial (no por mensajes informales a compañeros).

4. Cerrá sesión si compartís la PC con otra persona.`,
  },

  // Dashboard granular (resuelven por sufijo hasta `dash.*` luego dashboard)
  "dash.kpi": {
    tooltip: "Indicador clickeable.",
    what: `Número resumido (contador o métrica) calculado con los datos a los que tenés acceso; puede ser cantidad de formularios, trámites abiertos, etc., según la tarjeta.`,
    purpose: `Ver de un vistazo la magnitud y saltar al detalle con un solo clic si la tarjeta es enlace.`,
    how: `Uso:

1. Pasá el mouse para ver si hay tooltip extra.

2. Hacé clic en el cuerpo de la tarjeta (no solo en el ícono ℹ️) para navegar cuando esté habilitado.

3. Si el número te sorprende, cruzá con filtros en el módulo destino.

4. Usá clic derecho sobre el bloque para la guía larga del dashboard.`,
  },
  "dash.recentSubs": {
    tooltip: "Tabla de últimas respuestas.",
    what: `Tabla que lista los trámites o respuestas más recientes, con columnas según lo implementado (código, estado, fecha, formulario).`,
    purpose: `Atender primero lo último que entró sin abrir aún el módulo Respuestas completo.`,
    how: `Pasos:

1. Revisá cada fila: muchas permiten abrir detalle al hacer clic.

2. Usá el enlace “Ver todas” o equivalente para la bandeja completa con filtros.

3. Si la tabla está vacía, puede ser que no haya permisos de ver respuestas o que el rango sea muy reciente.

4. Ordená mentalmente por prioridad institucional antes de contestar ciudadanos.`,
  },
  "dash.quick": {
    tooltip: "Atajos a módulos frecuentes.",
    what: `Mosaicos o botones que llevan directo a Formularios, Respuestas, Usuarios, Empresas u otras rutas según lo que tu organización habilitó para tu rol.`,
    purpose: `Reducir la navegación por el menú lateral cuando ya sabés qué módulo necesitás.`,
    how: `Consejos:

1. Cada tile debería tener título claro; si no entendés el destino, usá clic derecho para esta ayuda.

2. No todos los roles ven los mismos atajos.

3. Si un atajo falla, puede ser falta de permiso: pedí a tu supervisor la matriz correspondiente.

4. Combiná con KPIs para armar un flujo: métrica → lista → detalle.`,
  },
  "dash.activity": {
    tooltip: "Actividad reciente resumida.",
    what: `Resumen textual o lista corta de eventos recientes (altas, cambios de estado, acciones masivas) según lo que el sistema registre para tu vista.`,
    purpose: `Darte contexto de movimiento del equipo sin abrir Auditoría.`,
    how: `Lectura:

1. Interpretá cada línea como señal, no como veredicto legal.

2. Para profundidad histórica y export, abrí Auditoría si tu rol lo permite.

3. Si el bloque no actualiza, recargá la página o revisá filtros globales.

4. Coordiná con compañeros si ves acciones inesperadas (posible cuenta mal usada).`,
  },
  "dash.tenantTable": {
    tooltip: "Listado instituciones (Super Admin).",
    what: `Tabla de empresas/tenants con métricas de plan, estado operativo o cantidad de recursos según columnas configuradas; suele ser vista de gobernanza central.`,
    purpose: `Supervisar el universo de clientes u organigramas montados en la plataforma.`,
    how: `Acciones:

1. Cada fila puede enlazar al módulo Empresas o a detalle según implementación.

2. No modifiques datos críticos sin ticket o procedimiento interno.

3. Exportá o filtrá solo si la política municipal lo permite.

4. Para dudas jurídicas sobre datos de terceros escalá al área legal institucional.`,
  },

  "forms.new": {
    tooltip: "Crear nuevo formulario.",
    what: `Inicia el constructor en blanco o con plantilla mínima para definir campos, textos legales, empresa asignada y políticas de publicación.`,
    purpose: `Publicar un trámite o encuesta nueva sin copiar archivos en papel.`,
    how: `Flujo sugerido:

1. Antes de publicar, consensuá con el área técnica el alcance y los datos personales que pedirás.

2. Asigná la empresa/tenant y categorías que correspondan.

3. Agregá campos en el orden en que el ciudadano debe completar; usá textos de ayuda bajo cada campo cuando haga falta.

4. Guardá borrador, revisá vista previa y solo entonces activá la respuesta pública si tu proceso lo permite.`,
  },
  "forms.preview": {
    tooltip: "Vista previa pública/interna.",
    what: `Abre una ventana o panel que simula exactamente lo que verá el ciudadano: mismo orden, validaciones y estilos principales.`,
    purpose: `Detectar errores de redacción, campos obligatorios faltantes o problemas de diseño antes de salir a producción.`,
    how: `Checklist:

1. Probá completar el formulario como si fueras el ciudadano.

2. Verificá mensajes de error y accesibilidad básica (contraste, tamaño).

3. Cerrá la vista previa y corregí en el constructor lo que haga falta.

4. Repetí hasta que responsable legal o técnico dé el OK.`,
  },
  "forms.copyLink": {
    tooltip: "Copiar URL del formulario.",
    what: `Copia al portapapeles la URL pública o interna del trámite, lista para pegar en correo, intranet o WhatsApp institucional.`,
    purpose: `Distribuir el acceso sin que la persona tenga que buscar en un menú.`,
    how: `Buenas prácticas:

1. Pegá solo en canales autorizados; no publiques en listas abiertas si el trámite es reservado.

2. Confirmá que el formulario siga vigente y no archivado.

3. Si el enlace vence o tiene límite de cupo, aclaralo al ciudadano.

4. Tras copiar, probá abrir el enlace en una ventana privada para verificar.`,
  },
  "forms.archive": {
    tooltip: "Archivar formulario.",
    what: `Mueve el formulario fuera de los listados activos principales; los datos históricos de respuestas suelen conservarse según política.`,
    purpose: `Dar por cerrado un instrumento que ya no debe recibir nuevas cargas (programa terminado, normativa reemplazada).`,
    how: `Antes de archivar:

1. Avisá al área y al ciudadano si aún quedan trámites abiertos.

2. Exportá estadísticas si tu gestión las necesita a futuro.

3. Confirmá en el diálogo; algunas acciones no son reversibles sin soporte.

4. Si necesitás rehabilitarlo, buscá la opción en edición o pedí a sistemas.`,
  },
  "forms.delete": {
    tooltip: "Eliminar formulario del sistema.",
    what: `Eliminación definitiva de la plantilla y, según configuración, impacto en estadísticas o tableros; no debe usarse para “ocultar un día”.`,
    purpose: `Corregir duplicaciones accidentales o borrar ensayos que nunca debieron publicarse.`,
    how: `Advertencias:

1. Requiere rol explícito de borrado; si no lo ves, no está permitido para tu usuario.

2. Leé el texto de confirmación: puede mencionar respuestas asociadas.

3. Coordiná con sistemas si hay integridad referencial con otros módulos.

4. Documentá el motivo del borrado en tu acta interna si la normativa lo exige.`,
  },
  "forms.responseLimit": {
    tooltip: "Límite temporal o por cantidad de respuestas.",
    what: `Configuración de ventana de tiempo máxima o tope de envíos aceptados para campañas con cupo, encuestas temporales o relevamientos cerrados.`,
    purpose: `Evitar que sigan entrando respuestas cuando la política o el presupuesto ya no lo permiten.`,
    how: `Pasos:

1. Abrí el modal de límite desde la tarjeta del formulario.

2. Definí fecha fin, cantidad máxima o ambas según lo que permita la UI.

3. Comunicá al equipo de atención el cierre para que no prometan plazos imposibles.

4. Probá el comportamiento con un envío de prueba antes del cierre masivo.`,
  },
  "forms.edit": {
    tooltip: "Ir al constructor para modificar campos y publicación.",
    what: `Abre el editor completo donde se gestionan secciones, validaciones, público destino y parámetros avanzados del formulario.`,
    purpose: `Mantener el trámite alineado a normativa sin reprogramar desde cero.`,
    how: `Trabajo seguro:

1. Guardá cambios incrementales para no perder la sesión.

2. Usá vista previa tras cada bloque de cambios sensibles.

3. Si otro colega edita el mismo formulario, coordiná para no pisar cambios (avisos por chat interno).

4. Tras publicar, revisá una respuesta de prueba en el entorno que corresponda.`,
  },
  "forms.row": {
    tooltip: "Tarjeta de formulario y acciones de fila.",
    what: `Fila o tarjeta que resume un formulario: nombre, estado, empresa, visibilidad y accesos rápidos en la parte inferior o menú contextual.`,
    purpose: `Operar el ABM sin entrar al constructor hasta que haga falta, ahorrando tiempo.`,
    how: `Mapa de acciones típicas:

- Copiar enlace público o interno.

- Establecer límites de respuesta.

- Editar, vista previa, archivar o eliminar según permisos.

1. Identificá primero el formulario correcto con búsqueda.

2. Usá el ícono ℹ️ para ayuda breve y clic derecho para la guía larga de la fila.

3. Si una acción está grisada, probablemente falte permiso.

4. Antes de borrar, verificá que no haya campaña institucional activa.`,
  },
  "forms.toggle": {
    tooltip: "Permutar opción rápida del formulario.",
    what: `Control compacto (interruptor) que activa o desactiva una opción del formulario, como visibilidad pública, aceptación de adjuntos pesados o flags internos según implementación.`,
    purpose: `Cambiar un comportamiento sin abrir el constructor completo en tareas rutinarias.`,
    how: `Instrucciones:

1. Mirá el color o etiqueta del toggle para saber el estado actual.

2. Un clic alterna entre activado y desactivado; si hay demora, esperá confirmación visual.

3. Si no podés cambiarlo, probablemente falte permiso o el formulario esté archivado.

4. Tras cambiar, verificá en vista previa que el efecto sea el esperado.`,
  },
  "forms.filter": {
    tooltip: "Filtros de listado.",
    what: `Conjunto de buscadores y desplegables para acotar qué formularios ves: texto libre, empresa, estado u otros campos según pantalla.`,
    purpose: `Trabajar con un subconjunto manejable cuando hay decenas de instrumentos cargados.`,
    how: `Uso práctico:

1. Empezá con el criterio más selectivo (ej. empresa) antes del texto libre.

2. Combiná filtros; limpiá cuando la lista quede demasiado vacía por error.

3. Guardá mentalmente la combinación si usás el mismo filtro todos los días.

4. Exportá o capturá pantalla si necesitás reportar el listado filtrado.`,
  },

  "empresas.new": {
    tooltip: "Alta empresa/tenant nueva.",
    what: `Asistente o modal de alta que crea un nuevo espacio aislado (tenant) con identificador, nombre visible y parámetros base para usuarios y trámites.`,
    purpose: `Incorporar un organismo o repartición nueva al ecosistema sin mezclar datos con los existentes.`,
    how: `Checklist:

1. Reuní nombre legal, responsable y límites que aplican en tu municipio.

2. Completá el formulario sin dejar campos obligatorios en blanco.

3. Guardá desde el pie del diálogo y esperá el mensaje de confirmación.

4. Tras crear, asigná áreas y usuarios desde los módulos correspondientes.`,
  },
  "areas.new": {
    tooltip: "Nueva área dentro de empresa.",
    what: `Modal de creación de unidad organizativa vinculada a una empresa concreta: nombres, códigos internos o responsables según lo definido para tu municipio.`,
    purpose: `Reflejar la estructura real para reportes, permisos y asignación de trámites.`,
    how: `Pasos:

1. Elegí la empresa correcta antes de guardar.

2. Definí nombre claro para que el resto del equipo entienda a qué secretaría corresponde.

3. Verificá vínculos con usuarios después del alta.

4. Si el modal falla por permisos, pedí rol de gestión de recursos del tenant.`,
  },
  "subs.sidebar": {
    tooltip: "Selector de formulario en vista Respuestas.",
    what: `Lista lateral que muestra cada formulario con volumen o indicador; al elegir uno se filtra la tabla principal de trámites para ese instrumento.`,
    purpose: `Evitar mezclar expedientes de trámites distintos en la misma grilla.`,
    how: `Cómo usarlo:

1. Hacé clic en la fila del formulario que necesitás atender ahora.

2. Observá si el contador o etiqueta refleja carga reciente.

3. Si la lista es larga, combiná con búsqueda global si existe.

4. Clic derecho en la zona lateral para la ayuda extendida de Respuestas.`,
  },
  "subs.refresh": {
    tooltip: "Forzar lectura remota servidor Firestore.",
    what: `Botón que vuelve a pedir los datos al servidor en lugar de confiar solo en lo ya mostrado en memoria o caché local del navegador en ese momento.`,
    purpose: `Ver respuestas o cambios de estado que otra persona acaba de registrar en otro equipo.`,
    how: `Buenas prácticas:

1. Usalo al comenzar un turno o tras una llamada que confirmó un cambio externo.

2. Esperá a que termine el indicador de carga antes de reclamar que “no aparece”.

3. Si recibís error de red, revisá conectividad y reintentá.

4. No sustituye filtros: si no ves el trámite, puede estar en otro estado o empresa.`,
  },
  "subs.filters": {
    tooltip: "Filtros de trámites.",
    what: `Panel o drawer donde acotás por fechas, empresa, estado del trámite, texto libre u otros criterios disponibles para la tabla de respuestas.`,
    purpose: `Reducir el ruido cuando hay cientos de expedientes y solo un subconjunto te compete hoy.`,
    how: `Flujo:

1. Abrí “Filtros” y marcá al menos un criterio útil (fecha desde/hasta es muy habitual).

2. Combiná estado y texto para encontrar un ciudadano concreto sin revelar datos innecesarios en pantallas públicas.

3. Cerrá el panel cuando termines; limpiá filtros para volver a la vista ancha.

4. Si el resultado está vacío, relajá un criterio (por ejemplo solo fecha).`,
  },
  "subs.delete": {
    tooltip: "Eliminar trámite o expediente.",
    what: `Acción que quita un registro de respuesta del sistema conforme la política municipal, a veces restringida a roles o casos excepcionales (duplicado, error de carga, pedido legal).`,
    purpose: `Corregir errores graves sin mantener copias contradictorias en la base.`,
    how: `Advertencias:

1. Leé el diálogo de confirmación: suele ser irreversible.

2. Verificá que no haya obligaciones legales de conservar el documento.

3. Dejá constancia interna de quién borró y por qué orden.

4. Si no ves el botón, tu usuario no tiene permiso de borrado.`,
  },
  "subs.bulk": {
    tooltip: "Acciones múltiples sobre filas seleccionadas.",
    what: `Barra o menú que aplica la misma operación a varios trámites marcados con casilla o modo selección múltiple.`,
    purpose: `Ahorrar tiempo cuando un cierre masivo o cambio de estado aplica a muchas filas iguales.`,
    how: `Procedimiento seguro:

1. Filtrá primero para no incluir trámites que no corresponden.

2. Marcá solo las filas deseadas y revisá el contador.

3. Elegí la acción masiva y leé el resumen antes de confirmar.

4. En caso de duda, procesá en lotes pequeños.`,
  },

  config: {
    tooltip: "Bloques de parámetros del sistema.",
    what: `Alias de ayuda para pantallas de ajustes: marca, comunicación u otros toggles según lo desplegado; el detalle coincide con la entrada “Configuración” principal.`,
    purpose: `Centralizar la experiencia de administración sin dispersar opciones en menús ocultos.`,
    how: `Navegá cada pestaña con calma y guardá cambios por bloque; la guía completa está también bajo la sección Configuración en este mismo índice de ayuda.`,
  },
  citizen: {
    tooltip: "Portal de seguimiento para el ciudadano.",
    what: `Pantalla pública donde la persona ingresa un código o referencia para conocer el estado de un trámite sin entrar al panel interno del municipio.`,
    purpose: `Dar transparencia y auto-consulta reduciendo llamadas a mesa de ayuda.`,
    how: `Para el ciudadano:

1. Ingresá exactamente el código que recibiste por correo o ticket.

2. No compartas el código en redes sociales: puede exponer datos personales.

3. Si el portal no encuentra el trámite, verificá dígitos y volvé a intentar.

4. Para reclamos formales usá los canales que indique tu municipio además de esta consulta.`,
  },
  admin: {
    tooltip: "Secciones para personal técnico o coordinación central.",
    what: `Panel con pestañas o tarjetas que agrupan métricas globales, herramientas de mantenimiento o vistas reservadas a roles muy privilegiados.`,
    purpose: `Operar la plataforma cuando el día a día municipal no alcanza para diagnosticar o corregir.`,
    how: `Reglas:

1. No ejecutes acciones masivas sin entender el impacto.

2. Explorá cada bloque con clic derecho para leer la guía específica.

3. Coordiná con el área de sistemas antes de tocar datos productivos.

4. Documentá hallazgos si encontrás anomalías.`,
  },
  globalMonitor: {
    tooltip: "Monitor global / observatorio.",
    what: `Vista de indicadores en tiempo casi real: tiempos de respuesta, colas, errores o estado de integraciones según bindings configurados en tu proyecto.`,
    purpose: `Detectar cuellos de botella o caídas antes de que afecten al ciudadano.`,
    how: `Uso:

1. Ajustá rango de tiempo o frecuencia de refresco si la UI lo permite.

2. No interpretes un pico puntual como caída total: correlacioná con otros gráficos.

3. Exportá o capturá evidencia si abrís incidencia formal.

4. Respetá la confidencialidad: muchos datos son solo internos.`,
  },
  syncPage: {
    tooltip: "Sincronización e integraciones batch.",
    what: `Pantalla con botones o trabajos programados que mueven datos entre FormaFlow y sistemas externos bajo control de servicio.`,
    purpose: `Mantener alineados los registros sin reingreso manual eterno.`,
    how: `Solo personal autorizado:

1. Leé la documentación municipal antes de lanzar un proceso.

2. Ejecutá en horario acordado para no competir con picos de uso.

3. Revisá logs o mensajes al final; anotá errores parciales.

4. Si un botón queda colgado, no lo pulses indefinidamente: reportá a sistemas.`,
  },
  "usuarios.invite": {
    tooltip: "Invitación por correo (Firebase).",
    what: `Flujo que crea una invitación pendiente y dispara un correo al futuro usuario con enlace para definir contraseña o aceptar acceso.`,
    purpose: `Dar de alta personas sin que el administrador maneje contraseñas en claro.`,
    how: `Pasos recomendados:

1. Verificá que el correo sea el oficial y esté bien escrito.

2. Completá empresa, rol y datos mínimos que exija el formulario.

3. Avisá a la persona por canal seguro que llegará un mail; que revise spam.

4. Si la invitación expira, generá una nueva desde la misma ficha.`,
  },
  "usuarios.create": {
    tooltip: "Creación directa de usuario y perfil.",
    what: `Crea la cuenta en Firebase Authentication, el documento en userProfiles y envía el correo de acceso según la plantilla municipal.`,
    purpose: `Altas urgentes o presenciales donde ya validaste identidad fuera del sistema.`,
    how: `Checklist:

1. Empresa y rol son obligatorios: asigná el mínimo privilegio necesario.

2. Confirmá que no exista ya un usuario con el mismo correo.

3. Entregá a la persona las instrucciones de primer ingreso por canal oficial.

4. Si el alta falla por límite de licencias, coordiná con administración central.`,
  },
  "usuarios.tab": {
    tooltip: "Alternar vista del módulo Usuarios.",
    what: `Pestañas que separan lista operativa, matriz de permisos y usuarios archivados para no mezclar tareas de distinta criticidad.`,
    purpose: `Enfocarte en una sola tarea mental: operación diaria vs ajustes finos de permisos vs historial.`,
    how: `Sugerencias:

1. Empezá por Lista para la mayoría de altas y bajas.

2. Pasá a Permisos solo cuando necesités excepciones por persona.

3. Archivados sirve para limpieza y auditoría, no para el día a día.

4. Recordá guardar si la pestaña tiene cambios pendientes.`,
  },
  "usuarios.permissionsIntro": {
    tooltip: "Editor estilo matriz de permisos.",
    what: `Bloque introductorio y controles donde se combinan plantillas por rol con concesiones o revocaciones puntuales por usuario.`,
    purpose: `Lograr el principio de mínimo privilegio sin editar código.`,
    how: `Buenas prácticas:

1. Partí del rol base y solo agregá excepciones justificadas.

2. Usá vista previa o simulación si está disponible antes de guardar.

3. Documentá por escrito las excepciones sensibles (acceso a datos personales).

4. Revisá periódicamente si las excepciones siguen vigentes.`,
  },
  "usuarios.row": {
    tooltip: "Acciones sobre un usuario de la tabla.",
    what: `Menú o botones en cada fila para ver ficha, ajustar permisos, reenviar invitación, activar, archivar o eliminar según el estado actual de la cuenta.`,
    purpose: `Resolver el ciclo de vida completo sin saltar entre sistemas.`,
    how: `Mapa rápido:

- Cuenta pendiente: reenviar invitación o cancelar si se equivocó el correo.

- Cuenta activa: revisar permisos, desactivar temporalmente o archivar.

- Archivada: restaurar o borrar definitivamente si política lo permite.

1. Confirmá siempre en diálogos destructivos.

2. No compartas capturas con datos personales fuera de canales seguros.

3. Si dos personas editan el mismo usuario, coordiná para no pisar cambios.

4. Pedí ID o correo exacto al reportar un problema a sistemas.`,
  },
  "usuarios.modal": {
    tooltip: "Formulario alta o edición de usuario.",
    what: `Ventana modal con campos de nombre, correo, empresa, rol, áreas opcionales y estado; valida contra reglas de Auth y tenant.`,
    purpose: `Mantener sincronizados el directorio municipal y los permisos efectivos.`,
    how: `Uso:

1. Cancelar cierra sin guardar; comprobá antes de salir si hubo cambios.

2. Guardar dispara validaciones: corregí mensajes en rojo antes de reintentar.

3. Si editás correo, puede requerir pasos extra en sistemas externos.

4. Tras guardar, verificá en la tabla que los datos quedaron como esperabas.`,
  },

  publicForm: {
    tooltip: "Formulario electrónico público o ciudadano.",
    what: `Experiencia optimizada para persona no autenticada o ciudadano que completa un trámite: validaciones de campos, adjuntos y mensajes de ayuda inline.`,
    purpose: `Recolectar información oficial sustituyendo papel cuando la normativa lo permite.`,
    how: `Para quien completa:

1. Leé cada apartado y los textos legales antes de enviar.

2. Prepará archivos en formatos y tamaños permitidos.

3. No recargues la página si está procesando envío: esperá confirmación.

4. Guardá el comprobante o código que muestre el sistema; servirá para seguimiento.`,
  },
  errors: {
    tooltip: "Pantalla de error del sistema.",
    what: `Vista amigable cuando falla la app o una ruta: muestra mensaje orientativo y acciones sugeridas en lugar de una página en blanco.`,
    purpose: `Reducir confusión y dar un siguiente paso (reintentar, volver, contactar soporte).`,
    how: `Qué hacer:

1. Anotá el código o mensaje exacto si debés abrir ticket.

2. Reintentá una vez tras unos segundos por si fue error de red.

3. No insistas docenas de veces seguidas: podés generar más carga.

4. Si el problema persiste, contactá al soporte municipal con captura y hora aproximada.`,
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
    case "settings":
    case "config":
    case "configuracion":
      return HELP_REGISTRY.settings;
    default:
      return HELP_REGISTRY.general;
  }
}

export const NAV_HELP = HELP_REGISTRY;
