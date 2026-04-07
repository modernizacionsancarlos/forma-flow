import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useForms } from "../api/useForms";
import { useSubmissions } from "../api/useSubmissions";
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  UploadCloud, 
  PenTool, 
  Trash2,
  Loader2,
  Calendar,
  Clock,
  ListChecks,
  CheckCircle2,
  ToggleLeft
} from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage as firebaseStorage } from "../lib/firebase";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-hot-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { hexToRgb, hexToHsl } from "../lib/colorUtils";


// --- Sub-components for Form Fields ---

const SignatureField = ({ value, onChange, label, error }) => {
  const sigPad = useRef(null);

  const clear = () => {
    sigPad.current.clear();
    onChange("");
  };

  const save = () => {
    if (sigPad.current.isEmpty()) return;
    onChange(sigPad.current.getTrimmedCanvas().toDataURL("image/png"));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
        <button onClick={clear} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:opacity-70 transition-opacity">Limpiar</button>
      </div>
      <div className="bg-white rounded-3xl overflow-hidden border-4 border-slate-900 shadow-inner h-64 relative group/sig">
        <SignatureCanvas 
          ref={sigPad}
          penColor="#0f172a"
          canvasProps={{ className: "signature-canvas w-full h-full" }}
          onEnd={save}
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <PenTool size={48} className="text-slate-950" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-[10px] font-black uppercase flex items-center space-x-2"><AlertCircle size={14} /><span>{error}</span></p>}
    </div>
  );
};

const FileField = ({ fieldId, onChange, label, error, value }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);
    
    try {
      const storageRef = ref(firebaseStorage, `submissions/${fieldId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      onChange(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
      <div className={`relative border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all ${value ? 'bg-primary/5 border-primary/30' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700/50'}`}>
         {uploading ? (
           <div className="flex flex-col items-center space-y-4">
             <Loader2 className="text-primary animate-spin" size={32} />
             <p className="text-[10px] font-black text-primary uppercase tracking-widest">Subiendo {fileName}...</p>
           </div>
         ) : value ? (
           <div className="flex flex-col items-center space-y-4 text-center">
             <div className="p-4 bg-primary/20 rounded-2xl text-primary shadow-lg border border-primary/20">
               <CheckCircle size={32} />
             </div>
             <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Archivo Adjunto</p>
                <p className="text-[9px] text-slate-500 font-bold max-w-[200px] truncate">{fileName || 'Documento cargado'}</p>
             </div>
             <button onClick={() => onChange("")} className="text-[10px] font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest flex items-center space-x-2">
                <Trash2 size={12} />
                <span>Eliminar</span>
             </button>
           </div>
         ) : (
           <label className="cursor-pointer flex flex-col items-center space-y-6 w-full group">
             <div className="p-6 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-500 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all shadow-xl group-hover:scale-110">
                <UploadCloud size={32} />
             </div>
             <div className="text-center">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">Seleccionar Archivo</p>
                <p className="text-[9px] text-slate-600 font-bold italic opacity-60">PDF, PNG o JPG (Máx. 5MB)</p>
             </div>
             <input type="file" className="hidden" onChange={handleFileChange} />
           </label>
         )}
      </div>
      {error && <p className="text-red-500 text-[10px] font-black uppercase flex items-center space-x-2"><AlertCircle size={14} /><span>{error}</span></p>}
    </div>
  );
};

const GPSField = ({ value, onChange, label, error }) => {
  const [locating, setLocating] = useState(false);

  const captureGPS = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(`${pos.coords.latitude}, ${pos.coords.longitude}`);
        setLocating(false);
      },
      () => {
        alert("No se pudo obtener la ubicación. Verifique permisos.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
      <div className={`p-8 border-2 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${value ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5' : 'bg-slate-950/50 border-slate-800'}`}>
         <div className="flex items-center space-x-6">
            <div className={`p-5 rounded-2xl border transition-all ${value ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
               <MapPin size={24} className={locating ? "animate-bounce" : ""} />
            </div>
            <div>
               <p className="text-[10px] font-black text-white uppercase tracking-widest">{value ? "Coordenadas Capturadas" : "Captura de Ubicación"}</p>
               <p className="text-[11px] font-mono font-black text-primary group-hover:text-primary transition-colors uppercase tracking-tight">
                  {locating ? "Obteniendo datos satelitales..." : value || "No se ha capturado ubicación"}
               </p>
            </div>
         </div>
         <button 
           type="button"
           onClick={captureGPS}
           disabled={locating}
           className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl disabled:opacity-50"
         >
           {value ? "Recapturar" : "Capturar Ubicación"}
         </button>
      </div>
      {error && <p className="text-red-500 text-[10px] font-black uppercase flex items-center space-x-2"><AlertCircle size={14} /><span>{error}</span></p>}
    </div>
  );
};

// --- Main Public Form Component ---

const PublicFormView = () => {
  const { formId } = useParams();
  const { getFormById } = useForms();
  const { submitForm } = useSubmissions();
  
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("loading"); // loading, ready, success, error, submitting
  const [submissionId, setSubmissionId] = useState(null);
  const [errors, setErrors] = useState({});
  const [branding, setBranding] = useState({
    primary_color: "#10b981",
    logo_url: null,
    name: "FormaFlow"
  });

  // Suscripción al branding del tenant una vez se carga el formulario
  useEffect(() => {
    if (!formSchema?.tenant_id) return;

    const unsubscribe = onSnapshot(doc(db, "tenants", formSchema.tenant_id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newBranding = {
          primary_color: data.branding?.primary_color || "#10b981",
          logo_url: data.branding?.logo_url || null,
          name: data.name || "FormaFlow"
        };
        setBranding(newBranding);
        
        // Inyectar variables CSS locales para este formulario
        const root = document.documentElement;
        root.style.setProperty("--primary-hex", newBranding.primary_color);
        root.style.setProperty("--primary-rgb", hexToRgb(newBranding.primary_color));
        root.style.setProperty("--primary", hexToHsl(newBranding.primary_color));
      }
    }, (error) => {
      console.error("Error al cargar branding público:", error);
    });

    return () => unsubscribe();
  }, [formSchema?.tenant_id]);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const schema = await getFormById(formId);
        if (schema && (schema.is_public || schema.status === "active")) {
          setFormSchema(schema);
          setStatus("ready");
          const allFields = schema.sections?.flatMap(s => s.fields) || schema.fields || [];
          const initialData = allFields.reduce((acc, f) => ({ ...acc, [f.id]: f.type === "boolean" ? false : "" }), {});
          setFormData(initialData);
        } else {
           setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };
    fetchForm();
  }, [formId, getFormById]);

  const isFieldVisible = (field) => {
    if (!field.logic || field.logic.length === 0) return true;
    
    const results = field.logic.map(rule => {
      const dependencyValue = formData[rule.fieldId];
      const targetValue = rule.value;
      
      const depStr = String(dependencyValue || "").toLowerCase();
      const tgtStr = String(targetValue || "").toLowerCase();

      switch (rule.operator) {
        case "==": return depStr === tgtStr;
        case "!=": return depStr !== tgtStr;
        case "contains": return depStr.includes(tgtStr);
        case "greater": return Number(dependencyValue || 0) > Number(targetValue || 0);
        case "less": return Number(dependencyValue || 0) < Number(targetValue || 0);
        default: return true;
      }
    });

    if (field.logicMatchType === "OR") {
      return results.some(r => r === true);
    }
    return results.every(r => r === true);
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => {
      const nextData = { ...prev, [fieldId]: value };
      return calculateFields(nextData, formSchema);
    });

    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // --- Calculation Engine (Atomic) ---
  const calculateFields = (data, schema) => {
    if (!schema) return data;
    const allFields = schema.sections?.flatMap(s => s.fields) || schema.fields || [];
    const calculatedFields = allFields.filter(f => f.isCalculated && f.formula);
    
    if (calculatedFields.length === 0) return data;

    let currentData = { ...data };
    let hasChanges = true;
    let iterations = 0;

    // Max 3 passes to resolve chained dependencies (A -> B -> C)
    while (hasChanges && iterations < 3) {
      hasChanges = false;
      calculatedFields.forEach(field => {
        try {
          let formula = field.formula;
          const matches = formula.match(/{{(.*?)}}/g);
          if (matches) {
            matches.forEach(match => {
              const depId = match.replace(/{{|}}/g, "");
              const val = Number(currentData[depId] || 0);
              formula = formula.replace(match, val);
            });
          }

          const result = new Function(`return ${formula}`)();
          const finalValue = isNaN(result) ? 0 : result;
          const finalStr = String(finalValue);

          if (currentData[field.id] !== finalStr) {
            currentData[field.id] = finalStr;
            hasChanges = true;
          }
        } catch {
          // Silent fail for incomplete formulas during typing
        }
      });
      iterations++;
    }
    return currentData;
  };

  const validateForm = () => {
    const newErrors = {};
    const allFields = formSchema.sections?.flatMap(s => s.fields) || formSchema.fields || [];
    
    allFields.forEach(field => {
      if (!isFieldVisible(field)) return;
      
      const value = formData[field.id];

      // 1. Required Check (Skipped for calculated fields as they are auto-filled)
      if (field.required && !field.isCalculated && (!value || value === "")) {
        newErrors[field.id] = "Este campo es obligatorio";
        return;
      }

      // 2. Advanced Validation Check
      if (field.validation && value) {
        const { type, pattern, errorMessage } = field.validation;
        let isValid = true;
        let defaultMsg = "Formato no válido";

        switch (type) {
          case "email":
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            defaultMsg = "Correo electrónico inválido";
            break;
          case "institutional_email":
            isValid = /^[^\s@]+@(municipio\.gov\.ar|modernizacionsancarlos\.gob\.ar)$/.test(value.toLowerCase());
            defaultMsg = "Debe usar un correo institucional (@municipio.gov.ar)";
            break;
          case "cuit": {
            const cleanCuit = String(value).replace(/[-_]/g, "");
            if (cleanCuit.length !== 11) {
              isValid = false;
            } else {
              const [v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11] = cleanCuit.split("").map(Number);
              const total = (v1 * 5) + (v2 * 4) + (v3 * 3) + (v4 * 2) + (v5 * 7) + (v6 * 6) + (v7 * 5) + (v8 * 4) + (v9 * 3) + (v10 * 2);
              let res = 11 - (total % 11);
              if (res === 11) res = 0;
              if (res === 10) res = 9;
              isValid = res === v11;
            }
            defaultMsg = "CUIT/CUIL no válido (Algoritmo Módulo 11)";
            break;
          }
          case "dni":
            isValid = /^\d{7,8}$/.test(value.replace(/\./g, ""));
            defaultMsg = "DNI debe tener entre 7 y 8 dígitos";
            break;
          case "phone":
            isValid = /^\+?[\d\s-]{10,15}$/.test(value);
            defaultMsg = "Número de teléfono inválido (10-15 dígitos)";
            break;
          case "regex":
            if (pattern) {
              try {
                const regex = new RegExp(pattern);
                isValid = regex.test(value);
              } catch {
                console.error("Invalid Regex pattern:", pattern);
              }
            }
            break;
          default:
            break;
        }

        if (!isValid) {
          newErrors[field.id] = errorMessage || defaultMsg;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus("submitting");
    const filteredData = {};
    const allFields = formSchema.sections?.flatMap(s => s.fields) || formSchema.fields || [];
    allFields.forEach(f => {
      if (isFieldVisible(f)) filteredData[f.id] = formData[f.id];
    });

    // --- Automation Engine: Submission Rules ---
    let finalStatus = "Pendiente";
    if (formSchema.submissionRules && formSchema.submissionRules.length > 0) {
      formSchema.submissionRules.forEach(rule => {
        const val = formData[rule.fieldId];
        const depStr = String(val || "").toLowerCase();
        const tgtStr = String(rule.value || "").toLowerCase();
        let match = false;

        switch (rule.operator) {
          case "==": match = depStr === tgtStr; break;
          case "!=": match = depStr !== tgtStr; break;
          case "greater": match = Number(val || 0) > Number(rule.value || 0); break;
          case "less": match = Number(val || 0) < Number(rule.value || 0); break;
          default: break;
        }

        if (match) {
          finalStatus = rule.action.value;
        }
      });
    }
    filteredData.status = finalStatus;
    // ------------------------------------------

    const result = await submitForm(filteredData, formId);

    if (result && result.success) {
      setSubmissionId(result.id || "LOCAL_" + Math.random().toString(36).substr(2, 9).toUpperCase());
      setStatus(result.offline || !result.synced ? "success_offline" : "success");
    } else {
      setStatus("ready");
      toast.error("Error al enviar. Intente más tarde.");
    }
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-inter">
      <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
      <p className="text-slate-500 mt-6 font-black tracking-widest uppercase text-[10px]">Cifrando Conexión SSL...</p>
    </div>
  );

  if (status === "error") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={64} className="text-red-500 mb-6 opacity-30" />
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Acceso Denegado</h1>
      <p className="text-slate-500 max-w-sm">No encontramos el formulario o no tienes permiso para visualizarlo públicamente.</p>
    </div>
  );

  if (status === "success" || status === "success_offline") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-inter">
      <div className={`w-24 h-24 ${status === 'success_offline' ? 'bg-amber-500/20 border-amber-500/20 shadow-amber-500/10' : 'bg-emerald-500/20 border-emerald-500/20 shadow-emerald-500/10'} rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border animate-in zoom-in-50 duration-500`}>
        {status === "success_offline" ? <Clock size={56} className="text-amber-500" /> : <CheckCircle size={56} className="text-emerald-500" />}
      </div>
      
      <h1 className={`text-4xl font-black text-white mb-4 tracking-tighter uppercase italic ${status === 'success_offline' ? 'text-amber-500' : 'text-white'}`}>
        {status === "success_offline" ? "REGISTRO GUARDADO LOCALMENTE" : "¡REGISTRO COMPLETADO!"}
      </h1>
      
      <p className="text-slate-500 max-w-xs font-bold leading-relaxed uppercase text-[10px] tracking-widest opacity-70 mb-12">
        {status === "success_offline" 
          ? "No detectamos conexión a internet. Los datos han sido cifrados y guardados en tu dispositivo. Se sincronizarán automáticamente al recuperar señal." 
          : "Tus datos han sido firmados y enviados de forma segura al nodo central de FormaFlow."}
      </p>
      
      {submissionId && !status.includes('offline') && (
        <div className="flex flex-col items-center w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {/* Tracking Card */}
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-[3rem] p-10 w-full backdrop-blur-xl relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
             
             <div className="flex flex-col md:flex-row items-center gap-8">
                {/* QR Section */}
                <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                   <QRCodeSVG 
                      value={`${window.location.origin}/portal?id=${submissionId}`}
                      size={120}
                      level="H"
                      includeMargin={false}
                   />
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                   <div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Tu Código Único</p>
                      <h2 className="text-2xl font-black text-white tracking-widest italic">{submissionId}</h2>
                   </div>
                   
                   <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(submissionId);
                          toast.success("¡Código copiado!", {
                            style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
                          });
                        }}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-500/20"
                      >
                        Copiar Código
                      </button>
                      <button 
                         onClick={() => {
                           const url = `${window.location.origin}/portal?id=${submissionId}`;
                           navigator.clipboard.writeText(url);
                           toast.success("¡Enlace de seguimiento copiado!");
                         }}
                         className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/5"
                      >
                        Copiar Enlace
                      </button>
                   </div>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] italic leading-relaxed">
                   Escanea el código con tu celular para seguir el estado<br/>
                   de tu trámite en tiempo real desde cualquier lugar.
                </p>
             </div>
          </div>
        </div>
      )}

      {status === 'success_offline' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-8 mb-12 max-w-sm animate-pulse">
           <div className="flex items-center space-x-4 text-amber-500 mb-2 justify-center">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Esperando Conexión...</span>
           </div>
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">No cierres esta pestaña si deseas asegurar la sincronización inmediata al volver a tener internet.</p>
        </div>
      )}


      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => window.location.reload()} className="px-10 py-5 bg-slate-900 text-white border border-slate-800 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 transition-all active:scale-[0.98]">Nuevo Registro</button>
        <button onClick={() => window.location.href = '/portal'} className="px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-900/40 active:scale-[0.98]">Ir al Portal de Seguimiento</button>
      </div>
    </div>
  );

  const renderField = (field) => {
    if (!isFieldVisible(field)) return null;
    const hasError = !!errors[field.id];

    // Field Content Wrapper
    const renderContent = () => {
      switch (field.type) {
        case "text":
        case "number":
          return (
            <input 
              type={field.type}
              placeholder={field.isCalculated ? "Valor calculado..." : (field.placeholder || "Esperando entrada...")}
              value={formData[field.id] || ""}
              onChange={(e) => !field.isCalculated && handleInputChange(field.id, e.target.value)}
              readOnly={field.isCalculated}
              className={`w-full bg-slate-950 border-2 rounded-2xl px-6 py-5 text-lg font-bold text-white focus:outline-none focus:ring-4 transition-all shadow-inner placeholder:text-slate-900 ${field.isCalculated ? "opacity-60 border-amber-500/30 text-amber-500 cursor-not-allowed select-none bg-amber-500/5" : hasError ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-800 focus:ring-emerald-500/10"}`}
            />
          );
        case "textarea":
          return (
            <textarea 
               rows={4}
               placeholder={field.placeholder || "Escriba aquí..."}
               value={formData[field.id] || ""}
               onChange={(e) => handleInputChange(field.id, e.target.value)}
               className={`w-full bg-slate-950 border-2 rounded-2xl px-6 py-5 text-lg font-bold text-white focus:outline-none focus:ring-4 transition-all shadow-inner placeholder:text-slate-900 resize-none ${hasError ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-800 focus:ring-emerald-500/10"}`}
            />
          );
        case "select":
          return (
            <select
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full bg-slate-950 border-2 rounded-2xl px-6 py-5 text-lg font-bold text-white focus:outline-none focus:ring-4 transition-all shadow-inner appearance-none ${hasError ? "border-red-500/50 focus:ring-red-500/10" : "border-slate-800 focus:ring-emerald-500/10"}`}
            >
              <option value="" disabled className="bg-slate-900">{field.placeholder || "Seleccione una opción"}</option>
              {field.options?.map((opt) => (
                <option key={opt.id} value={opt.value} className="bg-slate-900">{opt.label}</option>
              ))}
            </select>
          );
        case "multiselect": {
          const selectedValues = Array.isArray(formData[field.id]) ? formData[field.id] : [];
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {field.options?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const next = selectedValues.includes(opt.value)
                      ? selectedValues.filter(v => v !== opt.value)
                      : [...selectedValues, opt.value];
                    handleInputChange(field.id, next);
                  }}
                  className={`px-6 py-4 rounded-2xl border-2 font-bold text-sm transition-all text-left flex items-center justify-between ${
                    selectedValues.includes(opt.value)
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  {opt.label}
                  {selectedValues.includes(opt.value) && <CheckCircle size={16} />}
                </button>
              ))}
            </div>
          );
        }
        case "radio":
          return (
            <div className="space-y-3">
              {field.options?.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleInputChange(field.id, opt.value)}
                  className={`w-full px-6 py-5 rounded-2xl border-2 font-bold text-lg transition-all text-left flex items-center space-x-4 ${
                    formData[field.id] === opt.value
                      ? "bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                      : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData[field.id] === opt.value ? "border-primary" : "border-slate-800"}`}>
                    {formData[field.id] === opt.value && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          );
        case "boolean":
          return (
            <div className="flex items-center space-x-6 p-4">
              <div 
                onClick={() => handleInputChange(field.id, !formData[field.id])}
                className={`w-16 h-8 rounded-full transition-all cursor-pointer relative shadow-inner ${formData[field.id] ? "bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" : "bg-slate-800"}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${formData[field.id] ? "left-9" : "left-1"}`}></div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${formData[field.id] ? "text-primary" : "text-slate-600"}`}>
                 {formData[field.id] ? "Habilitado / Sí" : "Deshabilitado / No"}
              </span>
            </div>
          );
        case "file": return <FileField fieldId={field.id} value={formData[field.id]} label={field.label} onChange={(v) => handleInputChange(field.id, v)} error={errors[field.id]} />;
        case "signature": return <SignatureField value={formData[field.id]} label={field.label} onChange={(v) => handleInputChange(field.id, v)} error={errors[field.id]} />;
        case "gps": return <GPSField value={formData[field.id]} label={field.label} onChange={(v) => handleInputChange(field.id, v)} error={errors[field.id]} />;
        default: return <div className="text-rose-500 font-black italic uppercase text-[10px]">Tipo de campo incompleto: {field.type}</div>;
      }
    };

    // Skip wrapping custom components that handle their own labels/errors
    if (["file", "signature", "gps"].includes(field.type)) {
       return <div key={field.id} className="animate-in fade-in zoom-in-95 duration-500">{renderContent()}</div>;
    }

    return (
      <div key={field.id} className={`group flex flex-col space-y-3 p-8 border-2 rounded-[2.5rem] transition-all duration-500 ease-out animate-in fade-in zoom-in-95 ${
        hasError ? "bg-red-500/5 border-red-500/30 shadow-lg shadow-red-900/10" : "bg-slate-900/40 border-slate-800 hover:border-slate-700/50"
      }`}>
        <label className="text-[10px] font-black text-slate-400 flex items-center justify-between uppercase tracking-[0.2em] mb-2 px-2">
           <div className="flex items-center space-x-2">
             <span>{field.label}</span>
             {field.required && <span className="text-red-500 text-lg font-black">*</span>}
           </div>
        </label>
        {renderContent()}
        {errors[field.id] && <p className="text-red-500 text-[10px] font-black uppercase flex items-center space-x-2 pl-2 mt-2"><AlertCircle size={14} /><span>{errors[field.id]}</span></p>}
      </div>
    );
  };

  if (!formSchema) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter selection:bg-emerald-500/30 overflow-x-hidden relative">
      <div className="max-w-3xl mx-auto px-6 py-20 md:py-32 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />
        
        <header className="mb-24 space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center space-x-3 px-5 py-2 bg-slate-900/80 border border-white/5 rounded-full shadow-2xl backdrop-blur-xl">
             <div 
               className="w-2 h-2 rounded-full animate-pulse"
               style={{ backgroundColor: branding.primary_color, boxShadow: `0 0 10px ${branding.primary_color}80` }}
             ></div>
             <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Cifrado Activo por <span className="text-white">{branding.name}</span></span>
          </div>
          <div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.8] uppercase italic">{formSchema.title || "Formulario de Captura"}</h1>
            <p className="text-slate-500 text-xl leading-relaxed max-w-2xl font-bold italic tracking-tight opacity-70">{formSchema.description || "Sistema descentralizado de recolección de datos masiva."}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-28">
           {(formSchema.sections || []).length > 0 ? (
             formSchema.sections.map((section) => {
                const visibleFields = (section.fields || []).filter(isFieldVisible);
                if (visibleFields.length === 0) return null;
                return (
                  <section key={section.id} className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="flex items-center space-x-10">
                        <h2 className="text-2xl font-black text-white whitespace-nowrap uppercase tracking-[0.1em] italic">{section.title}</h2>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-900 via-slate-800 to-transparent"></div>
                     </div>
                     <div className="grid grid-cols-1 gap-10">
                       {section.fields.map(renderField)}
                     </div>
                  </section>
                );
             })
           ) : (
              <div className="grid grid-cols-1 gap-10">
                 {(formSchema.fields || []).map(renderField)}
              </div>
           )}

           <div className="pt-24 relative">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full group bg-emerald-600 hover:bg-emerald-500 text-white py-10 rounded-[3.5rem] font-black text-2xl uppercase tracking-[0.3em] flex items-center justify-center space-x-6 transition-all shadow-[0_30px_70px_rgba(16,185,129,0.2)] disabled:opacity-50 active:scale-[0.98] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                {status === "submitting" ? (
                   <Loader2 className="h-10 w-10 text-white animate-spin" />
                ) : (
                  <>
                    <span>Sincronizar y Enviar</span>
                    <ArrowRight size={36} className="group-hover:translate-x-4 transition-transform duration-700 ease-out" />
                  </>
                )}
              </button>
              <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-40">
                 <div className="flex items-center space-x-3">
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Protección Bancaria</span>
                 </div>
                 <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Geolocalización Auditada</span>
                 </div>
              </div>
           </div>
        </form>

        <footer className="mt-48 pt-20 border-t border-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-12 opacity-20 hover:opacity-100 transition-all duration-1000">
           <div className="flex items-center space-x-6">
              <div 
                className="w-16 h-16 bg-slate-900 border-2 border-slate-800 rounded-[2rem] flex items-center justify-center font-black text-white text-3xl shadow-2xl transition-transform hover:rotate-[-12deg] overflow-hidden"
                style={{ borderColor: `${branding.primary_color}40`, color: branding.primary_color }}
              >
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
                ) : (
                  branding.name[0]
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter text-white uppercase tracking-[0.3em]">{branding.name} System</span>
                <span className="text-[9px] text-slate-600 font-extrabold uppercase tracking-[0.1em]">Public Gateway v4.5.1-GOLD</span>
              </div>
           </div>
           <p className="text-[10px] text-slate-600 font-black text-center md:text-right leading-relaxed uppercase tracking-[0.2em]">
              Sincronización segura punto a punto.<br/>
              © 2026 {branding.name.toUpperCase()} - MODERNIZACIÓN.
           </p>
        </footer>
      </div>
    </div>
  );
};

export default PublicFormView;
