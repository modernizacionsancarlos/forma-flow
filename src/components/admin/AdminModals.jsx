import React, { useState } from 'react';
import { Users, Mail, X } from 'lucide-react';

export const UserModal = ({ isOpen, onClose, onSave, tenants, isSaving }) => {
  const [formData, setFormData] = useState({ email: "", role: "user", tenantId: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-blue-500/5 blur-3xl rounded-full" />
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
           <Users className="text-blue-500" />
           <span>Vincular Usuario</span>
        </h2>
        <p className="text-slate-500 text-sm mb-8 italic">Registra un nuevo operador en el sistema central.</p>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email del Usuario</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                required
                type="email" 
                disabled={isSaving}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="usuario@formaflow.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Rol / Permisos</label>
              <select 
                value={formData.role}
                disabled={isSaving}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-bold disabled:opacity-50"
              >
                <option value="user">Operador</option>
                <option value="admin">Admin Tenant</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Asignar Tenant</label>
              <select 
                required
                disabled={isSaving}
                value={formData.tenantId}
                onChange={(e) => setFormData({...formData, tenantId: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-bold disabled:opacity-50"
              >
                <option value="">Seleccionar...</option>
                <option value="Central_System">Sistema Central</option>
                {tenants?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex space-x-3">
             <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">Cancelar</button>
             <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-50">
               {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               <span>{isSaving ? "Registrando..." : "Registrar"}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TenantModal = ({ isOpen, onClose, tenant, onSave, isSaving }) => {
  const [formData, setFormData] = useState(tenant || { name: "", plan: "trial", status: "active", adminEmail: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2">{tenant ? "Editar Tenant" : "Nuevo Tenant"}</h2>
        <p className="text-slate-500 text-sm mb-8 italic">Configura el espacio de trabajo para la organización cliente.</p>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre de la Organización</label>
            <input 
              required
              disabled={isSaving}
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ej: Acme Corp"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Plan</label>
              <select 
                value={formData.plan}
                disabled={isSaving}
                onChange={(e) => setFormData({...formData, plan: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none disabled:opacity-50"
              >
                <option value="trial">Trial</option>
                <option value="standard">Standard</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Estado</label>
              <select 
                value={formData.status}
                disabled={isSaving}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none disabled:opacity-50"
              >
                <option value="active">Activo</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Email del Administrador</label>
            <input 
              required
              disabled={isSaving}
              type="email" 
              value={formData.adminEmail}
              onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
              placeholder="admin@organizacion.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50"
            />
          </div>

          <div className="pt-4 flex space-x-3">
             <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">Cancelar</button>
             <button type="submit" disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50">
               {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               <span>{isSaving ? "Guardando..." : "Guardar"}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
