import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import { computeEffectivePermissions } from "./permissions";
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
  /** Defaults por rol desde Firestore (`systemConfig/permissions`). */
  const permissionRoleDefaultsRef = useRef({});
  const initialClaimsRef = useRef({});

  const recomputeEffective = React.useCallback((mergedProfile) => {
    const eff = computeEffectivePermissions(mergedProfile, permissionRoleDefaultsRef.current);
    setClaims((c) => ({
      ...c,
      ...mergedProfile,
      effectivePermissions: eff,
    }));
  }, []);

  useEffect(() => {
    let unsubscribeProfile = null;
    let unsubscribePermConfig = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribePermConfig) unsubscribePermConfig();
      unsubscribeProfile = null;
      unsubscribePermConfig = null;

      if (currentUser) {
        setUser(currentUser);

        const idTokenResult = await currentUser.getIdTokenResult();
        const c = idTokenResult.claims;
        const tokenTenantId = c.tenantId ?? c.tenant_id ?? null;
        const rootEmail = "modernizacionsancarlos@gmail.com";
        const isOverride = currentUser.email === rootEmail;
        const initialClaims = {
          tenantId: tokenTenantId || (isOverride ? "Central_System" : null),
          role: c.role || (isOverride ? "super_admin" : null),
          email: currentUser.email?.toLowerCase(),
        };

        if (isOverride) {
          // Perfil raíz garantizado: evita que el Super Admin principal desaparezca del sistema.
          await setDoc(
            doc(db, "userProfiles", rootEmail),
            {
              email: rootEmail,
              role: "super_admin",
              tenantId: "Central_System",
              status: "active",
              user_name: "Administrador Central",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
        initialClaimsRef.current = initialClaims;
        setClaims({ ...initialClaims, effectivePermissions: [] });

        // Tras claims iniciales: listener solo con sesión (evita permission-denied en pantalla de login).
        unsubscribePermConfig = onSnapshot(
          doc(db, "systemConfig", "permissions"),
          (snap) => {
            permissionRoleDefaultsRef.current =
              snap.exists() && snap.data()?.roleDefaults && typeof snap.data().roleDefaults === "object"
                ? snap.data().roleDefaults
                : {};
            setClaims((prev) => {
              if (!prev?.email) return prev;
              const eff = computeEffectivePermissions(prev, permissionRoleDefaultsRef.current);
              return { ...prev, effectivePermissions: eff };
            });
          },
          () => {
            permissionRoleDefaultsRef.current = {};
          }
        );

        unsubscribeProfile = onSnapshot(
          doc(db, "userProfiles", currentUser.email.toLowerCase()),
          (docSnap) => {
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              const merged = { ...initialClaimsRef.current, ...profileData };
              const eff = computeEffectivePermissions(merged, permissionRoleDefaultsRef.current);
              setClaims({ ...merged, effectivePermissions: eff });
            } else {
              recomputeEffective({ ...initialClaimsRef.current });
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
        initialClaimsRef.current = {};
        permissionRoleDefaultsRef.current = {};
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribePermConfig) unsubscribePermConfig();
    };
  }, [recomputeEffective]);

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
