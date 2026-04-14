# Integración Funcional 100% (Adiós a los Mock Datas)

El objetivo de esta iteración es que Forma Flow pase de ser un diseño estático con algunos componentes conectados a una aplicación SaaS 100% interactiva, operando con Firebase Firestore de punta a punta. Se reemplazarán los arreglos *'dummy'* (datos de mentira) por *Custom Hooks* con `react-query` y se dotará de funcionalidad a los modales y botones que estaban inertes.

**Título propuesto para tu Commit:** 
`feat(integracion): migrar mock data a firebase, habilitar CRUD completo en vistas secundarias y modales funcionales`

## Decisiones Arquitectónicas (Aprobadas para SLA < 24hs)

Basado en la urgencia y el enfoque de un MVP de alto rendimiento, se han tomado las siguientes decisiones técnicas:

1. **Eficiencia en Relaciones NoSQL:** El contador de "Usuarios Asignados" en las Áreas permanecerá con un valor estático (`0`) o no visible temporalmente. Evitamos uniones (JOINs) relacionales costosas u operaciones de agregación en Firestore durante esta iteración crítica.
2. **Integridad sobre Estética:** La vista de Sincronización Offline mostrará **exclusivamente la realidad de la cola**. Si no hay errores, se verá vacía. En entornos productivos, es inaceptable mantener *mock data* en consolas de administración porque confunde el diagnóstico.
3. **Exportación Diferida:** Las "Exportaciones" solo generarán un log de auditoría (Simulación) indicando que un usuario solicitó datos. El motor complejo de generación nativa `.CSV` o `.PDF` se traslada post-lanzamiento para evitar que el *timeline* de 24 horas se vea comprometido por el formateo de datos.

## User Review Required

> [!IMPORTANT]
> Revisa el orden de ejecución propuesto a continuación. Si me confirmas con un **"Adelante"**, comenzaremos a intervenir el código inmediatamente para cumplir tu SLA de 24 horas.

---

## Proposed Changes (Orden de Ejecución Priorizado)

El plan de trabajo seguirá este orden lógico de dependencias e importancia de negocio:

### FASE A: Integridad del Dato y el Motor Offline (Sincronización)
*La red offline es la promesa principal de la PWA. Empezaremos limpiando la casa por el aspecto más propenso a crear confusión.*

#### [MODIFY] `src/pages/Sincronizacion.jsx`
- Eliminar por completo `mockSyncQueue`.
- Importar y enganchar verdaderamente la cola `offlineQueue` desde el hook maestro de la PWA global (`useSubmissions()`).
- Hacer que el botón superior "Forzar Sincronización" dispare métodos reales contra la base de datos local.
- Conectar botones "Individuales" para reintentos por unidad.

---

### FASE B: Cimientos Estructurales (CRUD de Áreas)
*Sin áreas no hay segregación. Este es el primer bloque real.*

#### [NEW] `src/api/useAreas.js`
- Hook con `@tanstack/react-query` para coleccion `Areas`. (Read, Create, Delete/Update).
#### [MODIFY] `src/pages/Areas.jsx`
- Reemplazar arrray `mockAreas` por el hook `useAreas()`.
- Agregar un formulario 100% funcional al Modal de "Nueva Área".
- Habilitar botón de opciones para manejo de inactividad/borrado de un Área.

---

### FASE C: Motor de Negocios (Workflows) 
*Una vez las áreas existen, se pueden gestionar los flujos de trabajo sobre ellas.*

#### [NEW] `src/api/useWorkflows.js`
- Hook de conexión contra colección `Workflows` asíncrona.
#### [MODIFY] `src/pages/Workflows.jsx`
- Extirpar `mockWorkflows` y usar `useWorkflows()`.
- Lógica en UI del formulario modal "Trazar Workflow" conectada a escrituras directas.

---

### FASE D: Limpieza Estética y Generadores (Form Builder y Exports)
*Ajustes finales estables de valor secundario.*

#### [MODIFY] `src/pages/FormBuilder.jsx`
- Retirar los datos autogenerados fantasma (ej: `{ id: "mock_1"... }`). Todo lienzo iniciará en blanco.
#### [NEW] `src/api/useExports.js`
- Hook a colección lógica de "Peticiones de Descarga".
#### [MODIFY] `src/pages/Exportaciones.jsx`
- Enlazar modal para que dispare un registro histórico visual ("Descarga iniciada por Usuario X") sin implementar el algoritmo final del PDF/CSV.

---

## Verification Plan

### Test en tiempo real
- **Desconexión forzada:** Apagaré el WiFi desde la pestaña Network en DevTools, cargaré un Formulario, y validaremos que al ingresar a *Sincronización* se refleje exactamente lo que la PWA almacenó de verdad, sin nada de relleno.
- **Flujo Creación Áreas:** Interaccionar en UI creando algo como "Atención Ciudadana", esperar la resolución e ir a Firebase Console (o recargar el área) y comprobar los datos en persistencia.
