# Integración Funcional 100% (Adiós a los Mock Datas)

El objetivo de esta iteración es que Forma Flow pase de ser un diseño estático con algunos componentes conectados a una aplicación SaaS 100% interactiva, operando con Firebase Firestore de punta a punta. Se reemplazarán los arreglos *'dummy'* (datos de mentira) por *Custom Hooks* con `react-query` y se dotará de funcionalidad a los modales y botones que estaban inertes.

**Título propuesto para tu Commit:** 
`feat(integracion): migrar mock data a firebase, habilitar CRUD completo en vistas secundarias y modales funcionales`

## User Review Required

> [!CAUTION]
> **Definición de Esquemas (Schemas):** 
> Al enlazar las vistas de **Áreas**, **Workflows** y **Exportaciones** a Firebase, se crearán nuevas colecciones en Firestore. Por favor, confirma si estás de acuerdo con los siguientes campos obligatorios para los modales de creación o si necesitamos agregar más.
> - **Áreas:** Nombre (texto), Estado (activo/pausado), TenantID (automático de sesión).
> - **Workflows:** Nombre (texto), Estado.
> - **Exportaciones:** Al pedir "Exportar", generaremos un registro simulado o real (Descarga de Forms). ¿Deseas que implementemos la exportación a CSV/PDF real o solo un registro de auditoría visual por el momento?

## Proposed Changes

---

### API Hooks (Conexión a Firebase)

Se crearán los manejadores de datos para conectar la UI con Firestore mediante `@tanstack/react-query`:

#### [NEW] [useAreas.js](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/api/useAreas.js)
Creación del hook para leer, crear, actualizar y borrar departamentos registrándolos en la colección `Areas`.

#### [NEW] [useWorkflows.js](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/api/useWorkflows.js)
Creación del hook para gestionar los ciclos de vida y estados personalizados en la colección `Workflows`.

#### [NEW] [useExports.js](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/api/useExports.js)
Creación del hook para registrar historiales de descargas y exportaciones asíncronas en la colección `Exports`.

---

### Páginas / Vistas a Modernizar

#### [MODIFY] [Areas.jsx](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/pages/Areas.jsx)
- Eliminar el array `mockAreas`.
- Usar el hook `useAreas()`.
- Agregar un formulario 100% funcional al Modal de "Nueva Área" para capturar el nombre y guardar en base de datos.
- Habilitar botón de "Opciones (MoreVertical)" para pausar/eliminar el área.

#### [MODIFY] [Workflows.jsx](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/pages/Workflows.jsx)
- Eliminar el array `mockWorkflows`.
- Usar el hook `useWorkflows()`.
- Implementar formulario interactivo en el Modal "Trazar Workflow" con campos de Nombre y Estado. 
- Reflejar en la tabla los datos sincronizados en tiempo real.

#### [MODIFY] [Exportaciones.jsx](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/pages/Exportaciones.jsx)
- Eliminar el array `mockExports`.
- Usar `useExports()`.
- Dar vida al botón Modal para solicitar un "Nuevo Reporte".

#### [MODIFY] [Sincronizacion.jsx](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/pages/Sincronizacion.jsx)
- Eliminar `mockSyncQueue`.
- Importar y usar la verdadera cola `offlineQueue` desde el hook `useSubmissions()`.
- Hacer que el botón superior "Forzar Sincronización" dispare `syncQueue()` en lugar de no hacer nada.
- Conectar botones "Individuales" para intentar reintentar formularios trancados.

#### [MODIFY] [FormBuilder.jsx](file:///d:/Trabajo/Municipalidad/Modernizacion/forma-flow/src/pages/FormBuilder.jsx)
- Quitar el campo ficticio por defecto (`{ id: "mock_1"... }`) o asegurarse de que solo se inyecte visualmente si es un Canvas vacío hasta que el usuario decida guardarlo. 

## Open Questions

> [!IMPORTANT]
> **Preguntas para que me contestes antes de avanzar:**
> 1. En la vista de **Áreas**, la tabla mostraba una columna "Usuarios Asignados". ¿Lo dejamos por ahora y yo le calculo un número aproximado/0, o quieres que implemente relacionalmente la lectura de qué usuarios pertenecen a qué área? (Te sugiero dejar un 0 por ahora para acelerar la conexión).
> 2. En la vista de **Sincronización**, el diseño es complejo. Al enlazar la "cola real", podríamos perder un poco de visuales lindas si no hay datos fallidos (ya que generalmente Firebase funciona bien en un 99% de las veces). ¿Estás de acuerdo con que limpie los *mocks* dejando la vista reluciente pero conectada a la verdad?
> 
> *Dime QUÉ opinas para que comencemos a codificar.*

## Verification Plan

### Test en tiempo real
- Crearé una Área nueva ingresando datos y confirmaré que se vea en Firestore y en la tabla (sin recargar la web).
- Apagaré el WiFi (usando la pestaña Network en DevTools), mandaré un Formulario, e iré a la vista "Sincronización" para verificar que está el formulario "atrapado" localmente. Al volver a tocar "Online", apretaré "Forzar Sincronización" y veré la magia ocurrir.
