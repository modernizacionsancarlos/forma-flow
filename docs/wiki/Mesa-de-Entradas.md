# 📥 Mesa de Entradas (Gestión y Auditoría)

La vista de **Respuestas** o Mesa de Entradas es la terminal de visualización que le permite a los inspectores cruzar datos en milisegundos tras haber recibido la información de los usuarios desde la plataforma.

Al igual que FormBuilder adopta el flujo *Tri-pane de visualización cruzada constante*:

## 1. Navegador de Campañas (Columna Izquierda)
Este panel contiene la estructura de formularios públicos creados previamente que se hallan bajo el estado de recolección.
- **Acción del usuario:** Clickeas en qué formulario deseas auditar u observar hoy, por ejemplo "Formulario Baches del centro de la ciudad".
- **Comportamiento Ténico:** Al clickear en la campaña deseada, el sistema hace un puente contra la Firebase y pre-limpia el buffer buscando las "Respuestas" (`responses`) que contengan de meta-data el `form_id` clickeado.

## 2. Bandeja de Auditoría de Registros (Columna Central)
Un listado minucioso mostrando quién ha respondido.
- **Filtros rápidos (Botones Pestaña):** Permiten segmentar entre envíos "Hoy", "Semana", "Todos". Reaccionan renderizando la lista central basada en el `created_at` del Payload nativo.
- **Tarjetas Táctiles:** Cada envío se traduce en un cuadrado individual, que lleva información como fecha de carga precisa, ID truncado y estado de la verificación.
- **Seleccionador:** Al darle click a la tarjeta, la Columna Derecha se abre instantáneamente trayendo el mapa paramétrico de la encuesta de este usuario puntilloso sin refrescar la página.

## 3. Visor de Unitarismo Individual (Columna Derecha)
Aquí puedes leer en profundidad lo que contestó el usuario.

### El Botón Central: "Exportar a PDF"
Para evitar el gasto enorme computacional de la máquina al querer hacer comprobantes de acta, el sistema delega ésto al microprocesador del explorador mediante la librería *`jsPDF`*.

- **Comportamiento del Botón:** Clickeas **Generar PDF**. El código del EventListener compila a escondidas un DOM virtual. Aplica el logo municipal, escribe una fuente compatible, re-mapea el bloque json completo en iteradoras, pinta el documento, lo empaqueta y luego usa `window.URL.revokeObjectURL(url)` para generar la ventana natural del computador pidiendo dónde guardar físicamente este PDF recién "horneado".

### Modos Sincronizados de Respuesta:
Si se abren estas 3 columnas enteras pero luego viene una nueva persona al edificio en el mostrador del costado, la nueva encuesta "Aparece sola en el medio a los pocos segundos" (Notificado por viñetas coloreadas) gracias al listener `onSnapshot()` mantenido a nivel código cliente por Firebase, previniendo cuellos de botella para el municipio.
