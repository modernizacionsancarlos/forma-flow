const DB_NAME = "FormaFlowOffline";
const DB_VERSION = 1;
const STORE_NAME = "pendingFiles";

/**
 * Abre la conexión a IndexedDB
 */
const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Guarda un archivo (Blob) localmente si el usuario está offline
 */
export const saveFileOffline = async (fieldId, file) => {
    const db = await openDB();
    const id = `${fieldId}_${Date.now()}`;
    const fileData = {
        id,
        fieldId,
        fileName: file.name,
        fileType: file.type,
        fileBlob: file, // Files/Blobs can be stored directly in IndexedDB
        createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(fileData);

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Obtiene todos los archivos pendientes
 */
export const getOfflineFiles = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

/**
 * Elimina un archivo de la cola local una vez subido con éxito
 */
export const removeOfflineFile = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
