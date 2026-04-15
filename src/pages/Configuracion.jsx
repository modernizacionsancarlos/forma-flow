import React, { useState } from "react";
import { Save, Layout, Palette, Loader2 } from "lucide-react";
import { useTenants } from "../api/useTenants";
import { useAuth } from "../lib/AuthContext";

const BrandingTab = ({ currentTenant, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    name: currentTenant?.name || "",
    primary_color: currentTenant?.branding?.primary_color || "#10b981",
    theme: currentTenant?.settings?.theme || "dark"
  });

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
              Logo Institucional
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              La carga de logo se gestiona manualmente a nivel local del entorno.
              Esta configuración fue deshabilitada para evitar cambios accidentales.
            </p>
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
              <div className="w-5 h-5 bg-white/20 rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white truncate w-24">{formData.name || "Institución"}</span>
              <span className="text-[8px] text-slate-500">FormFlow SaaS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
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
          <span>Guardar Configuración de Marca</span>
        </button>
      </div>
    </div>
  );
};

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { claims } = useAuth();
  const { tenants, updateTenant } = useTenants();
  
  const currentTenant = tenants?.find(t => t.id === claims.tenantId) || tenants?.[0];

  const handleSaveBranding = async (formData) => {
    if (!currentTenant) return;
    try {
      await updateTenant.mutateAsync({
        tenantId: currentTenant.id,
        updates: {
          name: formData.name,
          branding: {
            logo_url: currentTenant?.branding?.logo_url || "",
            primary_color: formData.primary_color
          }
        }
      });
      alert("Configuración de marca actualizada");
    } catch (err) {
      console.error("Error saving branding:", err);
      alert("Error al actualizar la marca");
    }
  };
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 p-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Configuración</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Ajustes globales del sistema para {currentTenant?.name}</p>
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
           Marca Blanca
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

        {activeTab === 'branding' && currentTenant && (
          <BrandingTab 
            key={currentTenant.id}
            currentTenant={currentTenant}
            onSave={handleSaveBranding}
            isLoading={updateTenant.isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Configuracion;
