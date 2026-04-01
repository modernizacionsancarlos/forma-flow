import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForms } from "../api/useForms";
import { useSubmissions } from "../api/useSubmissions";
import { CheckCircle, AlertCircle, Send, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

const PublicFormView = () => {
  const { formId } = useParams();
  const { getFormById } = useForms();
  const { submitForm } = useSubmissions();
  
  const [formSchema, setFormSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("loading"); // loading, ready, success, error, submitting
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const schema = await getFormById(formId);
        if (schema && (schema.is_public || schema.status === "active")) {
          setFormSchema(schema);
          setStatus("ready");
          
          // Flatten sections to initialize data
          const allFields = schema.sections?.flatMap(s => s.fields) || schema.fields || [];
          const initialData = allFields.reduce((acc, f) => ({ ...acc, [f.id]: "" }), {});
          setFormData(initialData);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };
    fetchForm();
  }, [formId]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const allFields = formSchema.sections?.flatMap(s => s.fields) || formSchema.fields || [];
    
    allFields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = "Este campo es obligatorio";
      }
      if (field.validation?.pattern && formData[field.id]) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(formData[field.id])) {
          newErrors[field.id] = field.validation.message || "Formato inválido";
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
    const result = await submitForm(formData, formId);
    
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("ready");
      alert("Error al enviar. Se intentará sincronizar cuando haya conexión.");
    }
  };

  if (status === "loading") return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (status === "error") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <AlertCircle size={64} className="text-red-500 mb-6 opacity-30" />
      <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Formulario no Encontrado</h1>
      <p className="text-slate-500 max-w-sm">Este formulario no existe, está inactivo o no cuenta con permisos de acceso público.</p>
    </div>
  );

  if (status === "success") return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 animate-in zoom-in-50 duration-500">
        <CheckCircle size={56} className="text-emerald-500" />
      </div>
      <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">¡ENVÍO EXITOSO!</h1>
      <p className="text-slate-400 max-w-sm font-medium leading-relaxed">Tus respuestas han sido procesadas correctamente y cifradas en el servidor central.</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-12 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900/40 active:scale-95"
      >
        Realizar otro Registro
      </button>
    </div>
  );

  const renderField = (field) => {
    const hasError = !!errors[field.id];
    
    return (
      <div key={field.id} className={`group flex flex-col space-y-3 p-8 border-2 rounded-[2rem] transition-all ${
        hasError ? "bg-red-500/5 border-red-500/30 shadow-lg shadow-red-900/10" : "bg-slate-900/40 border-slate-800 hover:border-slate-700/50"
      }`}>
        <label className="text-sm font-black text-slate-300 flex items-center justify-between uppercase tracking-widest">
           <div className="flex items-center space-x-2">
             <span>{field.label}</span>
             {field.required && <span className="text-red-500 text-lg font-black">*</span>}
           </div>
           {field.type === "gps" && <MapPin size={16} className="text-emerald-500/30" />}
        </label>
        
        {field.type === "text" || field.type === "number" ? (
          <input 
            type={field.type}
            placeholder={field.placeholder || "Esperando entrada..."}
            value={formData[field.id]}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`w-full bg-slate-950 border-2 rounded-[1.25rem] px-6 py-5 text-lg text-white focus:outline-none focus:ring-2 transition-all shadow-inner placeholder:text-slate-800 ${
              hasError ? "border-red-500/50 focus:ring-red-500" : "border-slate-800 focus:ring-emerald-500"
            }`}
          />
        ) : field.type === "checkbox" ? (
          <div className="flex items-center space-x-6 p-4">
            <div 
              onClick={() => handleInputChange(field.id, !formData[field.id])}
              className={`w-16 h-8 rounded-full transition-all cursor-pointer relative shadow-inner ${formData[field.id] ? "bg-emerald-600" : "bg-slate-800"}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${formData[field.id] ? "left-9" : "left-1"}`}></div>
            </div>
            <span className={`text-sm font-bold uppercase tracking-widest ${formData[field.id] ? "text-emerald-500" : "text-slate-600"}`}>
               {formData[field.id] ? "Habilitado" : "Deshabilitado"}
            </span>
          </div>
        ) : (
          <div className="bg-slate-950/80 border-2 border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center space-y-4 opacity-50">
             <div className="p-3 bg-slate-900 rounded-2xl ring-1 ring-slate-800">
               <ShieldCheck size={24} />
             </div>
             <p className="text-xs font-bold uppercase tracking-[0.2em]">{field.type} Captura Especial</p>
             <p className="text-xs italic">La captura de {field.type.toUpperCase()} se ejecutará en dispositivo móvil.</p>
          </div>
        )}

        {errors[field.id] && (
          <p className="text-red-500 text-[10px] font-black uppercase flex items-center space-x-2 pl-2">
            <AlertCircle size={14} />
            <span>{errors[field.id]}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-20 space-y-8 animate-in fade-in slide-in-from-top-10 duration-700">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 bg-emerald-600/10 border border-emerald-500/20 rounded-full">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Cifrado Activo por Empresa</span>
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[0.9]">{formSchema.title || "Formulario de Captura"}</h1>
            <p className="text-slate-500 text-xl leading-relaxed max-w-2xl font-medium">{formSchema.description || "Sistema descentralizado de recolección de datos."}</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-20">
           {(formSchema.sections || []).map((section) => (
             <section key={section.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center space-x-6">
                   <h2 className="text-2xl font-black text-white whitespace-nowrap">{section.title}</h2>
                   <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {(section.fields || []).map(renderField)}
                </div>
             </section>
           ))}
           
           {/* Fallback for old forms without sections */}
           {(!formSchema.sections || formSchema.sections.length === 0) && (
              <div className="grid grid-cols-1 gap-6">
                 {(formSchema.fields || []).map(renderField)}
              </div>
           )}

           <button 
             type="submit" 
             disabled={status === "submitting"}
             className="w-full group bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-widest flex items-center justify-center space-x-4 transition-all shadow-2xl shadow-emerald-900/30 disabled:opacity-50 active:scale-95 mt-16"
           >
             {status === "submitting" ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
             ) : (
               <>
                 <span>Firmar y Enviar</span>
                 <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
               </>
             )}
           </button>
        </form>

        <footer className="mt-32 pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 group hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0">
           <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center font-black text-emerald-500 text-xl shadow-lg">F</div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white uppercase tracking-widest">FormFlow System</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Enterprise Portal v2.0.4</span>
              </div>
           </div>
           <p className="text-xs text-slate-500 font-medium text-center md:text-right">Auditado por Sistema Central de Modernización.<br/>© 2026 Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicFormView;
