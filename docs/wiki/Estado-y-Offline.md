# 🧩 Lógica de Estado y Persistencia Offline

**Nivel de Dificultad: 🔴 Avanzado/Complejo**

Esta página documenta el "Sistema Nervioso Central" de **Forma Flow**, explicando cómo mantenemos la aplicación viva y libre de errores de sincronización incluso en los entornos con peor conectividad de la Municipalidad.

---

## 🧠 El Cerebro: Manejo de Estado con Zustand

En lugar de usar sistemas pesados como Redux, Forma Flow usa **Zustand**. 

### ¿Por qué es crítico?
- **Persistencia Atómica**: Cada vez que un usuario escribe una respuesta en un campo del formulario, el estado se actualiza en memoria en menos de **2 milisegundos**.
- **Desacoplamiento**: El componente del formulario no sabe que existe internet; él solo escribe en el "Store" local de Zustand.

---

## 🚠 Sincronización Offline-First (IndexedDB)

Para que el sistema funcione en zonas rurales o sótanos municipales sin señal, implementamos una capa intermedia de persistencia local.

### El Flujo de Datos Técnico:
1. **Acción**: El usuario presiona el botón "Enviar".
2. **Intercepción**: Un `Service Worker` o un Hook centralizado (`useSync`) verifica el estado de la red (`navigator.onLine`).
3. **Persistencia Local**: Si no hay red, la respuesta se empaqueta en un documento JSON y se guarda en **IndexedDB** (la base de datos interna del navegador).
4. **Listener en Segundo Plano**: Se activa un escuchador de eventos `online`. 
5. **Vaciado de Cola (Purge)**: Apenas el dispositivo detecta señal (así sea 3G mínimo), la app recorre la cola de IndexedDB y dispara peticiones `SetDoc` masivas a **Firebase Firestore**.

---

## ⚡ Reactividad con Firebase `onSnapshot`

En la **Mesa de Entradas**, los técnicos necesitan ver los datos apenas llegan. 

### El Concepto de WebSockets:
- No usamos un modelo de "Pull" (pedir datos cada 5 segundos).
- Usamos un modelo de "**Push**" (Firebase nos avisa).
- **Escalabilidad**: Esta conexión de socket abierto es extremadamente eficiente y gasta menos batería que estar recargando la página constantemente, permitiendo auditorías en tiempo real de cientos de registros simultáneos.

---

## 🛡️ Integridad de Esquemas Dinámicos

Uno de los retos más complejos es que el **Módulo de Respuestas** entienda un formulario que fue creado hace 5 minutos.
- **Mapeo Dinámico**: El visor de respuestas no tiene campos fijos (como "Nombre", "DNI"). 
- **Inyección de Tipos**: Lee el `JSON schema` guardado por el FormBuilder y construye la interfaz del visor de registros "en el aire" (On-the-fly), asegurando que si el administrador agrega una nueva pregunta al formulario, todos los reportes PDF anteriores y futuros se adapten automáticamente sin tocar el código.
