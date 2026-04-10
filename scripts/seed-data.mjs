import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyArkS3n2DgsSc6rk_cvhQW1GWE4K_wc6i0",
  authDomain: "formflow-central-cdbaa.firebaseapp.com",
  projectId: "formflow-central-cdbaa",
  storageBucket: "formflow-central-cdbaa.firebasestorage.app",
  messagingSenderId: "537198713998",
  appId: "1:537198713998:web:3848029cd0da6395963ddf"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding data...");

  // 1. Create a Tenant
  const tenantRef = doc(db, "tenants", "Central_System");
  await setDoc(tenantRef, {
    name: "Municipalidad Central",
    status: "active",
    plan: "enterprise",
    industry: "Gobierno",
    contact_email: "modernizacionsancarlos@gmail.com",
    created_date: Timestamp.now(),
    updated_date: Timestamp.now()
  });
  console.log("Tenant created.");

  // 2. Create a User Profile for the super admin
  const profileRef = doc(db, "userProfiles", "modernizacionsancarlos@gmail.com");
  await setDoc(profileRef, {
    full_name: "Administrador Central",
    role: "super_admin",
    tenantId: "Central_System",
    created_at: Timestamp.now()
  });
  console.log("User profile created.");

  // 3. Create a Dummy Form Schema
  const formRef = doc(db, "FormSchemas", "initial-form-demo");
  await setDoc(formRef, {
    title: "Solicitud de Audiencia Municipal",
    description: "Formulario inicial para pruebas de plataforma.",
    status: "active",
    is_public: true,
    tenant_id: "Central_System",
    created_date: Timestamp.now(),
    updated_date: Timestamp.now(),
    fields: [
      { id: "f1", type: "text", label: "Nombre Completo", required: true },
      { id: "f2", type: "email", label: "Correo Electrónico", required: true },
      { id: "f3", type: "textarea", label: "Motivo de la Audiencia", required: false }
    ]
  });
  console.log("Demo form created.");

  // 4. Create a Dummy Submission
  const subRef = doc(db, "Submissions", "demo-submission-1");
  await setDoc(subRef, {
    schema_id: "initial-form-demo",
    tenant_id: "Central_System",
    status: "pendiente",
    created_date: Timestamp.now(),
    data: {
      f1: "Juan Pérez",
      f2: "juan.perez@example.com",
      f3: "Consulta sobre alumbrado público."
    }
  });
  console.log("Demo submission created.");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
