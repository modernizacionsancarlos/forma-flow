import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";
import { hexToRgb, hexToHsl } from "./colorUtils";
import { BrandingContext } from "./BrandingContext";

export const BrandingProvider = ({ children }) => {
    const { claims } = useAuth();
    const [branding, setBranding] = useState({
        primary_color: "#10b981",
        logo_url: null,
        name: "FormaFlow"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Si no hay tenantId o es el sistema central, usar valores por defecto
        if (!claims?.tenantId || claims.tenantId === "Central_System") {
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
                setBranding(newBranding);
                
                // Inyectar variables CSS dinámicamente en el :root
                // Esto permite que Tailwind use var(--primary) y se actualice en tiempo real
                const root = document.documentElement;
                root.style.setProperty("--primary-hex", newBranding.primary_color);
                root.style.setProperty("--primary-rgb", hexToRgb(newBranding.primary_color));
                root.style.setProperty("--primary", hexToHsl(newBranding.primary_color));
                
                // Actualizar el título de la pestaña dinámicamente
                document.title = `${newBranding.name} | FormaFlow`;
            }
            setLoading(false);
        }, (error) => {
            console.error("Error al obtener branding del tenant:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [claims?.tenantId]);

    const value = {
        branding,
        loading
    };

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    );
};
