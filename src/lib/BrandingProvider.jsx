import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import { hexToRgb, hexToHsl } from "./colorUtils";
import { BrandingContext } from "./BrandingContext";

export const BrandingProvider = ({ children }) => {
    const { claims, user } = useAuth();
    const defaultBranding = {
        primary_color: "#10b981",
        logo_url: null,
        name: "FormaFlow"
    };
    const [baseBranding, setBaseBranding] = useState(defaultBranding);
    const [localBranding, setLocalBranding] = useState({});
    const [loading, setLoading] = useState(true);
    const userIdentity = (claims?.email || user?.email || "anon").toLowerCase();
    const brandingStorageKey = `formaflow_branding_prefs_${userIdentity}`;

    // Cargar overrides locales por usuario (no globales)
    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(brandingStorageKey);
            setLocalBranding(raw ? JSON.parse(raw) : {});
        } catch (error) {
            console.error("Error cargando branding local:", error);
            setLocalBranding({});
        }
    }, [brandingStorageKey]);

    useEffect(() => {
        // Si no hay tenantId o es el sistema central, usar valores por defecto
        if (!claims?.tenantId || claims.tenantId === "Central_System") {
            setBaseBranding(defaultBranding);
            const timer = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timer);
        }

        // Suscripción en tiempo real al documento del tenant para White-label
        const unsubscribe = onSnapshot(doc(db, "tenants", claims.tenantId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const newBranding = {
                    primary_color: data.branding?.primary_color || "#10b981",
                    logo_url: data.branding?.logo_url || null,
                    name: data.name || "FormaFlow"
                };
                setBaseBranding(newBranding);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener branding del tenant:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [claims?.tenantId]);

    const branding = {
        ...baseBranding,
        ...localBranding,
    };

    // Inyectar variables CSS de branding final (base + local por usuario)
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--primary-hex", branding.primary_color);
        root.style.setProperty("--primary-rgb", hexToRgb(branding.primary_color));
        root.style.setProperty("--primary", hexToHsl(branding.primary_color));
        document.title = `${branding.name || "FormaFlow"} | FormaFlow`;
    }, [branding.primary_color, branding.name]);

    const saveLocalBranding = (updates) => {
        const next = { ...localBranding, ...updates };
        setLocalBranding(next);
        try {
            window.localStorage.setItem(brandingStorageKey, JSON.stringify(next));
        } catch (error) {
            console.error("Error guardando branding local:", error);
        }
    };

    const resetLocalBranding = () => {
        setLocalBranding({});
        try {
            window.localStorage.removeItem(brandingStorageKey);
        } catch (error) {
            console.error("Error reseteando branding local:", error);
        }
    };

    const value = {
        branding,
        loading,
        saveLocalBranding,
        resetLocalBranding,
        localBranding
    };

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    );
};
