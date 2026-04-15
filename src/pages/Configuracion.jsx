import React, { useState } from "react";
import { Save, Layout, Palette, Loader2, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { useBranding } from "../lib/useBranding";

const BrandingTab = ({ currentBranding, onSave, onReset, isLoading, localLogoStorageKey }) => {
  const [formData, setFormData] = useState({
    name: currentBranding?.name || "",
    logo_url: currentBranding?.logo_url || "",
    primary_color: currentBranding?.primary_color || "#10b981",
    theme: "dark"
  });
  const [isUploadingLocalLogo, setIsUploadingLocalLogo] = useState(false);

  const handleLocalLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Selecciona un archivo de imagen válido.");
      return;
    }

    setIsUploadingLocalLogo(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
        reader.readAsDataURL(file);
      });
      window.localStorage.setItem(localLogoStorageKey, String(dataUrl));
      alert("Logo local aplicado en este usuario/equipo.");
    } catch (error) {
      console.error("Error al cargar logo local:", error);
      alert("No se pudo cargar el logo local.");
    } finally {
      setIsUploadingLocalLogo(false);
      event.target.value = "";
    }
  };

  const handleClearLocalLogo = () => {
    window.localStorage.removeItem(localLogoStorageKey);
    window.localStorage.removeItem("formaflow_local_logo_data_url");
    alert("Logo local eliminado. Se usará el logo por URL o el predeterminado.");
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center">
           <Palette className="text-[#10b981]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tighter">Marca e Identidad</h2>
          <p className="text-slate-500 text-sm">Ajusta los elementos visuales de tu institución.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre Institucional</label>
            <input 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Municipalidad de San Carlos"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all text-white"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
              Logo Institucional (Local)
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Puedes cargar un archivo local solo para este usuario en este equipo.
              No se sube al repositorio y no afecta a otros usuarios.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold cursor-pointer transition-colors">
                <Upload size={14} />
                {isUploadingLocalLogo ? "Cargando..." : "Subir archivo local"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLocalLogoUpload} />
              </label>
              <button
                type="button"
                onClick={handleClearLocalLogo}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold transition-colors"
              >
                <Trash2 size={14} />
                Quitar local
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">URL del Logo (Opcional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Color Primario</label>
            <div className="flex items-center space-x-3">
              <input 
                type="color"
                value={formData.primary_color}
                onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                className="w-12 h-12 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden"
              />
              <input 
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all text-white uppercase font-mono"
              />
            </div>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] border border-white/5 bg-slate-900/20 flex flex-col items-center justify-center space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vista Previa (Sidebar)</span>
          <div className="w-full max-w-[200px] bg-[#0a101b] border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-2xl">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: formData.primary_color }}
            >
              {formData.logo_url ? (
                <img src={formData.logo_url} alt="Logo URL" className="w-5 h-5 object-contain" />
              ) : (
                <div className="w-5 h-5 bg-white/20 rounded-full" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate w-24">{formData.name || "Institución"}</span>
              <span className="text-[8px] text-slate-500">FormFlow SaaS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center space-x-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-slate-700 text-slate-300 hover:border-slate-500"
          >
            <Trash2 size={16} />
            <span>Restablecer local</span>
          </button>
          <button 
            onClick={() => onSave(formData)}
            disabled={isLoading}
            className="group flex items-center space-x-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-[#10b981] hover:bg-[#10b981]/80 text-[#0a101b] shadow-[#10b981]/20 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} className="group-hover:scale-110 transition-transform" />
            )}
            <span>Guardar Personalización Local</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { claims, user } = useAuth();
  const { branding, saveLocalBranding, resetLocalBranding } = useBranding();
  const localUserIdentity = (claims?.email || user?.email || "anon").toLowerCase();
  const localLogoStorageKey = `formaflow_local_logo_data_url_${localUserIdentity}`;
  const displayName = claims?.full_name || user?.displayName || claims?.email?.split("@")[0] || "usuario";

  const handleSaveBranding = (formData) => {
    try {
      saveLocalBranding({
        name: formData.name,
        logo_url: formData.logo_url,
        primary_color: formData.primary_color,
      });
      alert("Personalización local guardada para tu usuario.");
    } catch (err) {
      console.error("Error saving local branding:", err);
      alert("Error al guardar personalización local");
    }
  };

  const handleResetLocalBranding = () => {
    resetLocalBranding();
    window.localStorage.removeItem(localLogoStorageKey);
    window.localStorage.removeItem("formaflow_local_logo_data_url");
    alert("Personalización local restablecida para tu usuario.");
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 p-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Configuración</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            Ajustes locales de apariencia para {displayName}
          </p>
        </div>
      </div>

      <div className="flex space-x-8 border-b border-white/5">
         <button 
           onClick={() => setActiveTab("general")}
           className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'general' ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400'}`}
         >
           General
           {activeTab === 'general' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]"></span>}
         </button>
         <button 
            onClick={() => setActiveTab("branding")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'branding' ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400'}`}
         >
           Apariencia
           {activeTab === 'branding' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]"></span>}
         </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl min-h-[400px]">
        {activeTab === 'general' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
                 <Layout className="text-slate-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tighter">Apariencia y UI</h2>
                <p className="text-slate-500 text-sm">Personaliza la experiencia visual del administrador.</p>
              </div>
            </div>
            <div className="text-slate-400 italic">Próximamente más opciones de configuración general...</div>
          </div>
        )}

        {activeTab === 'branding' && (
          <BrandingTab 
            key={localUserIdentity}
            currentBranding={branding}
            onSave={handleSaveBranding}
            onReset={handleResetLocalBranding}
            isLoading={false}
            localLogoStorageKey={localLogoStorageKey}
          />
        )}
      </div>
    </div>
  );
};

export default Configuracion;
