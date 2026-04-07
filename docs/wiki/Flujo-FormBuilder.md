# 🛠️ FormBuilder (Creador de Formularios Avanzado)

El modulo de **FormBuilder** es la vista donde los administradores construyen encuestas o auditorias interactivas usando un lienzo central interactivo.

## Conceptos Generales de la Vista

El diseño del creador posee el patrón **Layout Tri-Pane**, lo que significa que la pantalla está dividida en tres grandes columnas:
1. **Listado / Selección rápida** (Izquierda): Listado general de tus borradores y formularios.
2. **El Canvas** (Centro): Es tu lienzo de drag-and-drop (arrastrar y soltar) donde se visualizará el campo que la gente luego verá públicamente.
3. **Inspector de Propiedades** (Derecha): El cuadro dinámico que cambia sus opciones dependiendo de qué toques en el Canvas.

---

## 🔍 Panel 1: El Canvas y los Campos (Centro)
El canvas soporta interacciones de puntero donde cada elemento agregado se denomina técnicamente un `FormNode` en el código.

### Tipos de Campos disponibles:
- **Texto Corto / Largo:** Ideales para nombres, apellidos o comentarios (Texarea).
- **Selecciones múltiples / únicas:** Desplegables `<select>` nativos o checkboxes/radio buttons diseñados para recolectar datos tabulares específicos.
- **Botones de adjunto:** Generan los listeners para Firebase Storage, pidiendo fotos o comprobantes al usuario final.

### Reordenamiento:
Cada vez que el usuario clickea una "Flecha" de flechas arriba u abajo en el botón `Reordenador`, React clona internamente el array y altera los índices del elemento en tiempo de ejecución de manera ultra rápida enviando feedback visual liso.

---

## 🎛️ Panel 2: Inspector de Roles y Propiedades (Derecha)
Al clickear cualquier campo dibujado en el centro, la vista del Inspector despierta, captando el State global de Zustand.

### Configuraciones soportadas aquí:
1. **Label (Etiqueta principal):** Modificar el título de este campo concreto en pantalla.
2. **Placeholder (Ayudamemoria):** El texto gris transparente que va de fondo en las cajas sin que el usuario escriba, para orientarlo.
3. **Toggle Obligatoriedad (Requerido):** El **botón Switch verde**, si tú lo marcas en "true", le añade una marca (*) al form público y previene usando validaciones frontend severas en HTML5 que alguien pueda presionar *Enviar* si saltaron este requerimiento.

### Flujo de guardado ("Guardar Formulario")
Cuando tocas el gran botón de guardado en la esquina, la app empaqueta esta enorme matriz de objetos de campos y convierte todos las configuraciones, nombres y estados y lo guarda directamente en JSON dentro de un solo documento gigante persistido en **Firestore Database**.
