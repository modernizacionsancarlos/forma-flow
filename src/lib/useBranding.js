import { useContext } from "react";
import { BrandingContext } from "./BrandingContext";

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
};
