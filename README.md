# Forma Flow - Modernización Municipal

Sistema SaaS integral para la gestión de formularios dinámicos, flujos de trabajo e inspecciones. Creado para optimizar los procesos internos de la Municipalidad, permitiendo la recolección de datos en tiempo real, auditoría de respuestas y organización de la información de forma centralizada.

## 🌟 Características Principales

Basado en la arquitectura premium "True Black", el sistema ofrece:
- **FormBuilder Avanzado (Layout Tri-Pane)**: Creador de formularios drag-and-drop con inspector de propiedades contextual.
- **Explorador de Respuestas (Mesa de Entradas)**: Interfaz de 3 columnas para navegar entre formularios, filtrar envíos y auditar respuestas al instante.
- **Generación de Actas de Auditoría**: Descarga directa de reportes PDF tabulados usando jsPDF.
- **Dashboards en Tiempo Real**: Tarjetas de métricas (Stat Cards) con estilo *Glow Ambient* para el monitoreo de KPIs de la plataforma.
- **Sincronización Offline First**: Funcionamiento robusto incluso con conectividad intermitente.

## 🛠️ Stack Tecnológico

El proyecto está construido con un stack moderno, enfocado en performance y estética premium:

### Frontend
- **React 19**: Biblioteca principal para la construcción de interfaces.
- **Vite**: Bundler y entorno de desarrollo ultra rápido.
- **Tailwind CSS v4**: Estilos utilitarios para un diseño *Glassmorphism* personalizado.
- **Lucide React**: Íconos vectoriales modernos de alta resolución.
- **Recharts**: Gráficos dinámicos para los paneles de administración.
- **Zustand / Context API**: Manejo de estado global para la sesión y UI.

### Infraestructura (Firebase)
Usamos **Firebase** como nuestro único backend (BaaS - Backend as a Service), aprovechando:
- **Firestore**: Base de datos NoSQL en tiempo real para almacenar formularios, respuestas, configuraciones de tenants y usuarios.
- **Authentication**: Autenticación segura de usuarios (Email/Password y proveedores OAuth).
- **Storage**: Almacenamiento seguro en la nube para adjuntos, firmas e imágenes subidas en los formularios.
- **Hosting**: Alojamiento web ultrarrápido con CDN global para distribuir la Single Page Application (SPA).
- **Security Rules**: Reglas estrictas en Firestore y Storage para garantizar que cada tenant (municipio/departamento) solo acceda a su propia información.

## 💻 Desarrollo Local (Cómo probarlo en tu compu)

Para levantar el proyecto en tu entorno local, seguí estos pasos:

1. **Cloná el repositorio**:
   ```bash
   git clone <url-del-repo>
   cd forma-flow
   ```

2. **Instalá las dependencias**:
   Solo tenés que abrir tu terminal en la carpeta del proyecto y correr este único comando para bajar todo lo necesario:
   ```bash
   npm install
   ```

3. **Configurá las variables de entorno**:
   Creá un archivo `.env` en la raíz del proyecto (basado en un `.env.example` si existe) y pegá las credenciales de Firebase de tu proyecto de desarrollo.

4. **Levantá el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Esto va a iniciar Vite. Abrí tu navegador y entrá a `http://localhost:5173` para ver la app funcionando.

## 🚀 Despliegue en Producción (Firebase Hosting)

Cuando quieras publicar una nueva versión para que esté disponible online, hacé lo siguiente:

1. **Autenticate en Firebase CLI**:
   Si no lo hiciste antes, iniciá sesión en la terminal:
   ```bash
   firebase login
   ```

2. **Asegurate de apuntar al proyecto correcto**:
   Si tenés múltiples entornos (ej. dev y prod), seleccioná el proyecto correspondiente:
   ```bash
   firebase use <id-de-tu-proyecto-firebase>
   ```

3. **Construí la aplicación (Build)**:
   Esto genera los archivos estáticos optimizados en la carpeta `dist`.
   ```bash
   npm run build
   ```

4. **Desplegá a Hosting**:
   Subí los archivos de la carpeta `dist` a los servidores de Google.
   ```bash
   firebase deploy --only hosting
   ```
   *(Nota: Podés usar simplemente `firebase deploy` si también necesitás actualizar las Reglas de Firestore/Storage o las Cloud Functions de una sola pasada).*

---

**Desarrollado para el equipo de Modernización de la Municipalidad de San Carlos.** 
*Interfaces de nivel mundial para la gestión pública.*
