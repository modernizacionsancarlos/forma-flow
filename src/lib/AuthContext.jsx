import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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

    const unsubPerm = onSnapshot(
      doc(db, "systemConfig", "permissions"),
      (snap) => {
        permissionRoleDefaultsRef.current =
          snap.exists() && snap.data()?.roleDefaults && typeof snap.data().roleDefaults === "object"
            ? snap.data().roleDefaults
            : {};
        // Recalcular con último perfil conocido
        setClaims((c) => {
          if (!c?.role && !c?.email) return c;
          const eff = computeEffectivePermissions(c, permissionRoleDefaultsRef.current);
          return { ...c, effectivePermissions: eff };
        });
      },
      () => {
        permissionRoleDefaultsRef.current = {};
      }
    );
    unsubscribePermConfig = unsubPerm;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) unsubscribeProfile();

      if (currentUser) {
        setUser(currentUser);

        const idTokenResult = await currentUser.getIdTokenResult();
        const c = idTokenResult.claims;
        const tokenTenantId = c.tenantId ?? c.tenant_id ?? null;
        const isOverride = currentUser.email === "modernizacionsancarlos@gmail.com";
        const initialClaims = {
          tenantId: tokenTenantId || (isOverride ? "Central_System" : null),
          role: c.role || (isOverride ? "super_admin" : null),
          email: currentUser.email?.toLowerCase(),
        };
        initialClaimsRef.current = initialClaims;
        setClaims({ ...initialClaims, effectivePermissions: [] });

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
