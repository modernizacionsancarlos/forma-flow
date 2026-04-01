import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyArkS3n2DgsSc6rk_cvhQW1GWE4K_wc6i0",
  authDomain: "formflow-central-cdbaa.firebaseapp.com",
  projectId: "formflow-central-cdbaa",
  storageBucket: "formflow-central-cdbaa.firebasestorage.app",
  messagingSenderId: "537198713998",
  appId: "1:537198713998:web:3848029cd0da6395963ddf",
  measurementId: "G-SDC74MDWMD"
};

// Singleton pattern for Firebase initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;

