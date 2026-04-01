import React, { useState } from "react";
import { Settings, Save, Shield, Database, Layout } from "lucide-react";

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Configuración</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Ajustes globales del sistema</p>
        </div>
        <button className="group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-slate-800 hover:bg-slate-700 text-white shadow-slate-900/50">
          <Save size={18} className="group-hover:scale-110 transition-transform" />
          <span>Guardar Cambios</span>
        </button>
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
            onClick={() => setActiveTab("security")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'security' ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400'}`}
         >
           Seguridad
           {activeTab === 'security' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]"></span>}
         </button>
         <button 
            onClick={() => setActiveTab("data")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'data' ? 'text-slate-300' : 'text-slate-600 hover:text-slate-400'}`}
         >
           Datos y Caché
           {activeTab === 'data' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]"></span>}
         </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Tema del Sistema</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 transition-all text-white appearance-none">
                    <option value="dark">True Black (Predeterminado)</option>
                    <option value="light">Claro (Próximamente)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Idioma Predeterminado</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 transition-all text-white appearance-none">
                    <option value="es">Español (Argentina)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Formato de Fecha</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 transition-all text-white appearance-none">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
           <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
                 <Shield className="text-slate-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tighter">Políticas de Seguridad</h2>
                <p className="text-slate-500 text-sm">Reglas de acceso y autenticación.</p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-slate-900/50">
                 <div>
                   <h3 className="text-sm font-bold text-white">Forzar 2FA</h3>
                   <p className="text-xs text-slate-500 mt-1">Requiere autenticación de dos factores para todos los admins.</p>
                 </div>
                 <button className="w-12 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 relative flex items-center px-1">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 translate-x-6"></div>
                 </button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
           <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
                 <Database className="text-slate-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tighter">Retención y Caché</h2>
                <p className="text-slate-500 text-sm">Gestión de datos almacenados localmente.</p>
              </div>
            </div>
            
            <div className="space-y-6">
               <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                 <h3 className="text-sm font-bold text-red-400 mb-2">Zona de Peligro</h3>
                 <p className="text-xs text-slate-500 mb-4">Borrar la caché local forzará una resincronización completa con el servidor en el próximo inicio.</p>
                 <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold transition-colors">
                   Purgar Caché Offline
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;
