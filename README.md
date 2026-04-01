# Forma Flow - Modernización Municipal

Sistema integral para la gestión de formularios, flujos de trabajo y reportes dinámicos. Diseñado para optimizar los procesos internos de la Municipalidad, permitiendo un seguimiento en tiempo real y una mejor organización de la información.

## 🚀 Uso del Sistema

La plataforma permite a los usuarios:
- Gestionar formularios dinámicos y sus respectivos estados.
- Visualizar métricas e indicadores clave mediante tableros dinámicos (Recharts).
- Organizar tareas y procesos mediante un sistema de Drag and Drop.
- Generar y descargar reportes detallados en formato PDF (jsPDF).

## 🛠️ Stack Tecnológico

Este proyecto está construido con herramientas modernas para asegurar rendimiento y escalabilidad:

### Core & Frameworks
- **React 19**: Biblioteca principal para la interfaz de usuario.
- **Vite**: Herramienta de construcción (build tool) ultra rápida para desarrollo moderno.
- **React Router Dom**: Gestión de la navegación y rutas dinámicas.
- **TanStack React Query**: Manejo eficiente de caché, sincronización y peticiones de datos.

### Estilo & UI
- **Tailwind CSS**: Framework de utilidades CSS para un diseño personalizado y responsivo.
- **Shadcn UI**: Componentes de interfaz de alta calidad, accesibles y personalizables.
- **Lucide React**: Set de íconos vectoriales modernos de alta resolución.

### Estructura del Proyecto

El código fuente se organiza siguiendo las mejores prácticas de modularidad:
- **`src/api/`**: Contiene la lógica de interacción directa con Firebase (Firestore, Auth, Storage).
- **`src/components/`**: Componentes de UI reutilizables (Botones, Inputs, Layouts, etc.).
- **`src/lib/`**: Utilidades, configuraciones y funciones auxiliares del sistema.
- **`src/pages/`**: Vistas principales de la aplicación (Home, Dashboards, Listados).
- **`src/App.jsx`**: Componente raíz que gestiona las rutas y el estado global.
- **`src/main.jsx`**: Punto de entrada de la aplicación React.

### Firebase (Backend & Infraestructura)
Utilizamos **Firebase** para la infraestructura del servidor, aprovechando los siguientes servicios:
- **Firestore**: Base de datos NoSQL para el almacenamiento de datos en tiempo real.
- **Authentication**: Sistema robusto de gestión de usuarios y accesos.
- **Hosting**: Alojamiento optimizado para la aplicación web.
- **Firebase Storage**: Almacenamiento seguro para archivos y documentos adjuntos.
- **Firebase Rules**: Gestión de seguridad para el acceso a datos.

## 💻 Desarrollo Local

Para correr el proyecto en tu entorno local, seguí estos pasos:

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repo>
   cd forma-flow
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Esto levantará el servidor local en `http://localhost:5173` (por defecto).

4. **Construir para producción**:
   ```bash
   npm run build
   ```

5. **Previsualizar la versión de producción**:
   ```bash
   npm run preview
   ```

## 🌐 Despliegue en Firebase Hosting

Para publicar los cambios en el entorno de producción:

1. **Asegurate de estar autenticado en Firebase**:
   ```bash
   firebase login
   ```

2. **Construí la aplicación**:
   ```bash
   npm run build
   ```

3. **Desplegá a Hosting**:
   ```bash
   firebase deploy --only hosting
   ```
   *(También podés usar `firebase deploy` para subir reglas de Firestore y Storage si hubo cambios en los archivos `.rules` o `.json`)*.

---

**Desarrollado para el equipo de Modernización de la Municipalidad de San Carlos.**
