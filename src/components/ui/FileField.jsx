import React, { useState, useEffect } from "react";
import { UploadCloud, CheckCircle, Loader2, Trash2, AlertCircle, CloudOff } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage as firebaseStorage } from "../../lib/firebase";
import { saveFileOffline } from "../../lib/offlineFiles";

const FileField = ({ fieldId, onChange, label, error, value }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);
    
    try {
      if (navigator.onLine) {
        // En línea: Subida directa a Firebase
        const storageRef = ref(firebaseStorage, `submissions/${fieldId}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        onChange(url);
      } else {
        // Offline: Guardar en IndexedDB
        const id = await saveFileOffline(fieldId, file);
        // Informamos al padre de que hay un archivo pendiente (usaremos el ID temporal)
        onChange(`offline://${id}`);
      }
    } catch (err) {
      console.error("Error en gestión de archivo:", err);
      alert("Error al procesar el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setFileName(null);
  };

  const isOfflineValue = typeof value === "string" && value.startsWith("offline://");

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
      
      <div className={`relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all ${
        (value || isOfflineValue) ? 'bg-primary/5 border-primary/30' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700/50'
      }`}>
         
         {uploading ? (
           <div className="flex flex-col items-center space-y-4">
             <Loader2 className="text-primary animate-spin" size={32} />
             <p className="text-[10px] font-black text-primary uppercase tracking-widest">
               {isOffline ? "Guardando localmente..." : `Subiendo ${fileName}...`}
             </p>
           </div>
         ) : (value || isOfflineValue) ? (
           <div className="flex flex-col items-center space-y-4 text-center">
             <div className={`p-4 rounded-2xl shadow-lg border ${
                isOfflineValue ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/20 text-primary border-primary/20'
             }`}>
               {isOfflineValue ? <CloudOff size={32} /> : <CheckCircle size={32} />}
             </div>
             
             <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">
                  {isOfflineValue ? "Archivo en Cola Offline" : "Archivo Adjunto"}
                </p>
                <p className="text-[9px] text-slate-500 font-bold max-w-[200px] truncate">
                  {fileName || 'Documento cargado'}
                </p>
                {isOfflineValue && (
                  <p className="text-[8px] text-amber-500 font-black uppercase mt-1">Se subirá al recuperar conexión</p>
                )}
             </div>

             <button 
               onClick={handleRemove} 
               className="text-[10px] font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest flex items-center space-x-2"
             >
                <Trash2 size={12} />
                <span>Eliminar</span>
             </button>
           </div>
         ) : (
           <label className="cursor-pointer flex flex-col items-center space-y-6 w-full group">
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-500 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-xl group-hover:scale-110">
                <UploadCloud size={32} />
             </div>
             <div className="text-center">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">
                  {isOffline ? "Adjuntar para Sincronizar" : "Seleccionar Archivo"}
                </p>
                <p className="text-[9px] text-slate-600 font-bold italic opacity-60">PDF, PNG o JPG (Máx. 5MB)</p>
             </div>
             <input type="file" className="hidden" onChange={handleFileChange} />
           </label>
         )}
      </div>

      {error && (
        <p className="text-red-500 text-[10px] font-black uppercase flex items-center space-x-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FileField;
