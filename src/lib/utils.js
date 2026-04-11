import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}


export const isIframe = window.self !== window.top;

/**
 * Removes undefined values recursively from an object.
 * Necessary for Firestore which rejects 'undefined' but allows 'null'.
 */
export function cleanObject(obj) {
    if (obj === null || typeof obj !== 'object') return obj;

    // Preserve specialized objects like Dates or Firestore Timestamps
    if (obj.constructor && (obj.constructor.name === 'Timestamp' || obj.constructor.name === 'Date')) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj
            .map(cleanObject)
            .filter(v => v !== undefined);
    }

    return Object.fromEntries(
        Object.entries(obj)
            .map(([k, v]) => [k, cleanObject(v)])
            .filter(([, v]) => v !== undefined)
    );
}
