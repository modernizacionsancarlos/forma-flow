# QA smoke — FormaFlow

Rutina corta antes de **deploy** o **release**. Completar en orden; marcar cada ítem.

## Automatizado (CI / local)

Ejecutar:

```bash
npm run qa
```

Debe terminar sin errores (lint + build).

---

## Entorno

- [ ] Existe `.env` local (copiado desde `.env.example`) con credenciales Firebase reales para el entorno que vas a probar.
- [ ] `npm install` ya ejecutado sin errores.

---

## Navegador (Chrome o Edge recomendado para PWA)

Preparar: `npm run dev` y abrir la URL que muestra Vite (típicamente `http://localhost:5173`).

### Autenticación y shell

- [ ] **Login**: ingresar usuario válido → redirige al dashboard sin error en consola crítico.
- [ ] **Logout** desde el layout → vuelve a `/login`.
- [ ] **Sidebar / drawer móvil**: abrir menú, navegar a otra ruta → el drawer se cierra al cambiar de página.
- [ ] Rutas protegidas sin sesión → redirigen a login.

### Formularios (interno)

- [ ] **Lista de formularios** (`/forms`) carga sin pantalla en blanco.
- [ ] **Nuevo / editar formulario** (`/forms/new`): guardar borrador o publicar según flujo habitual.
- [ ] **Vista previa** del formulario (modal o iframe según implementación) muestra el formulario.

### Respuestas

- [ ] **Respuestas** (`/submissions`): lista o estado vacío coherente; sin errores de red recurrentes.

### PWA

- [ ] Tras unos segundos de uso, aparece el **aviso de instalación** (o “Ahora no” lo pospone). En **HTTPS** o **localhost** Chrome suele ofrecer instalación.
- [ ] En **iPhone Safari**: si no hay botón nativo, la guía “Compartir → Añadir a pantalla de inicio” es coherente.

### Público

- [ ] Abrir URL de formulario público (ej. `/public-form/:id` o la que uses en prod) **sin login** → se renderiza y permite enviar si el formulario lo permite.
- [ ] Si hay **ventana horaria / límite**: comportamiento acorde (mensaje de cerrado o espera).

### Errores HTTP

- [ ] Ruta inexistente → página **404** (`NotFound`).
- [ ] `/error` o equivalente si lo usan para pruebas → **ServerError** sin romper la app.

---

## Producción / hosting

- [ ] Tras `npm run build`, carpeta `dist/` presente y `firebase deploy --only hosting` (o tu pipeline) sin errores.
- [ ] Sitio en HTTPS: manifest y service worker cargan (DevTools → Application).

---

**Registro de última pasada:** anotar fecha y responsable abajo.

| Fecha | Responsable | Entorno (dev/staging/prod) | Resultado |
|-------|-------------|-----------------------------|-----------|
|       |             |                             |           |
