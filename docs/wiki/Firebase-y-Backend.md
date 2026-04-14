<![CDATA[# 🔥 Arquitectura y Ecosistema Firebase Backend

**Forma Flow** no posee un backend de servidor tradicional (como Node.js o PHP) bajo tu administración, ya que en su lugar delega la responsabilidad de estado global, alojamiento y persistencia a **Firebase**, la solución BaaS (Backend-as-a-Service) de Google.

A continuación, se detalla qué hace cada componente:

---

## 1. 🌐 Firebase Hosting (Alojar el Proyecto)
Es el CDN (Content Delivery Network) global de nuestro proyecto Frontend. 
- **Función:** Servir de manera extremadamente rápida todos los archivos HTML, CSS y Javascript construidos con Vite/React a cualquier persona de la ciudad.
- **URL de Producción:** [formaflow-sancarlos.web.app](https://formaflow-sancarlos.web.app)
- **Operación detrás de escena:** Al enviar el proyecto desde el terminal con `npm run build-deploy`, Vite minifica todo y lo sube al Hosting, preconfigurando certificados de seguridad HTTPS automáticos y compresión agresiva.
- **¿Por qué se usa?** Reduce los tiempos de carga drásticamente (menos de 1 segundo en móvil).

## 2. 🔐 Firebase Authentication (El Portero del Sistema)
Autenticación es el muro lógico y el guardia que revisa credenciales de quienes intentan acceder al sistema administrativo o crear formularios.
- **Función:** Generación de un token seguro o Ticket de Pase (JWT) tras proporcionar correo electrónico y contraseña.  
- **Custom Claims:** Cada usuario tiene claims personalizados que definen su `role` (super_admin, admin, user) y su `tenantId` (a qué organización pertenece).
- **Vínculo UI:** El botón **"Iniciar Sesión"** se conecta con Firebase Auth. React toma este Token y lo almacena usando el AuthContext. Si el Token es válido, el sistema muestra las rutas protegidas según el rol del usuario.

## 3. 🗄️ Firestore Database (La Memoria del SaaS)
Es el corazón técnico del negocio, una base de datos NoSQL jerárquica y reactiva.
- **Estructura Interna:** En Firestore la información se guarda en "Documentos JSON" agrupados en Colecciones.
- **Colecciones Clave:** 
  - `forms_schemas`: Diseño de formularios del FormBuilder
  - `submissions`: Respuestas de ciudadanos/inspectores con estado, timestamps y metadatos
  - `userProfiles`: Perfiles con rol, tenant y configuración
  - `tenants`: Organizaciones registradas en la plataforma
  - `areas`: Departamentos y ubicaciones
  - `workflows`: Flujos de trabajo con transiciones de estado
  - `exports`: Registro de exportaciones realizadas
  - `audit_log`: Trazabilidad completa de acciones del sistema
- **Real-Time:** La conexión a Firestore usa WebSockets. La Mesa de Entradas se actualiza instantáneamente cuando un ciudadano envía una respuesta.

## 4. 🛡️ Firestore Security Rules (El Blindaje)
Las reglas evitan hackeos o escrituras indebidas.
- **Multi-Tenant:** Cada documento está atado a un `tenantId`. Las reglas verifican que el usuario autenticado pertenezca al tenant correcto antes de permitir lectura o escritura.
- **Mecánica Defensiva:** Si un usuario sin sesión autenticada intenta manipular datos, las Security Rules frenan la petición devolviendo un "*Error 403 Forbidden*" porque la orden viene sin un JWT administrativo válido.
- **Super Admin Override:** Los usuarios con claim `role: super_admin` pueden leer datos de cualquier tenant para la vista de Dashboard Global.

## 5. 📂 Firebase Cloud Storage (El Archivo Histórico)
Todo archivo binario (que *no* es texto) recae aquí.
- **Función:** Guardado masivo y asíncrono de archivos adjuntos.
- **Usos en FormaFlow:** 
  - Exportaciones generadas (archivos XLSX/JSON) se suben a Storage y se registra la URL de descarga en Firestore.
  - Inputs de tipo archivo en formularios públicos (fotos, documentos, firmas digitales).
- **Seguridad:** Las Storage Rules restringen acceso por organización, similar a las Firestore Rules.

## 6. 📢 Firebase Cloud Messaging (Notificaciones Push)
Sistema de alertas en tiempo real para web y móvil.
- **Función:** Enviar notificaciones push al navegador del usuario cuando ocurren eventos relevantes (nueva respuesta, cambio de estado, etc.).
- **VAPID Key:** Configurada vía variable de entorno `VITE_FIREBASE_VAPID_KEY` para autenticar el envío de mensajes web push.
- **Foreground:** Las notificaciones que llegan mientras la app está abierta se muestran como toast notifications usando `react-hot-toast`.
]]>
