import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import Loader from "../components/ui/Loader";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState({});

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Limpiar suscripción previa si existe
      if (unsubscribeProfile) unsubscribeProfile();

      if (currentUser) {
        setUser(currentUser);
        
        // Carga inicial rápida de claims desde el token (si existen)
        const idTokenResult = await currentUser.getIdTokenResult();
        const isOverride = currentUser.email === "modernizacionsancarlos@gmail.com";
        
        const initialClaims = {
            tenantId: idTokenResult.claims.tenantId || (isOverride ? "Central_System" : null),
            role: idTokenResult.claims.role || (isOverride ? "super_admin" : null),
        };
        setClaims(initialClaims);

        // Suscripción en tiempo real al perfil en Firestore
        unsubscribeProfile = onSnapshot(
          doc(db, "userProfiles", currentUser.email.toLowerCase()), 
          (docSnap) => {
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              setClaims({
                ...initialClaims,
                ...profileData
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error al obtener perfil:", error);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setClaims({});
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    claims,
    currentProfile: claims,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Loader fullScreen text="Autenticando..." /> : children}
    </AuthContext.Provider>
  );
};
