import React, { useState } from "react";
import { Plus, Building2, Search, X, Shield, Trash2 } from "lucide-react";
import { useTenants } from "../api/useTenants";

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
    trial: "bg-blue-500/10 text-blue-500 border-blue-500/30",
    suspended: "bg-red-500/10 text-red-500 border-red-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status] || styles.active}`}>
      {status || "active"}
    </span>
  );
};

const TenantModal = ({ isOpen, onClose, tenant, onSave, isSaving }) => {
  const [formData, setFormData] = useState(tenant || { name: "", plan: "trial", status: "active", adminEmail: "" });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-2">{tenant ? "Editar Empresa" : "Nueva Empresa"}</h2>
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
              placeholder="Ej: Municipalidad"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Plan</label>
              <select 
                value={formData.plan}
                disabled={isSaving}
                onChange={(e) => setFormData({...formData, plan: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none disabled:opacity-50 text-white"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all appearance-none disabled:opacity-50 text-white"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all disabled:opacity-50 text-white"
            />
          </div>

          <div className="pt-4 flex space-x-3">
             <button type="button" onClick={onClose} disabled={isSaving} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50">Cancelar</button>
             <button type="submit" disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-glow-emerald flex items-center justify-center space-x-2 disabled:opacity-50">
               {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               <span>{isSaving ? "Guardando..." : "Guardar"}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TenantRow = ({ tenant, onEdit, onDelete }) => (
  <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group">
    <td className="py-4 pl-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
           <Building2 size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">{tenant.name || "Empresa Desconocida"}</p>
          <p className="text-xs font-mono text-slate-500">{tenant.id}</p>
        </div>
      </div>
    </td>
    <td className="py-4">
      <div className="flex flex-col">
        <span className="text-sm text-white pb-1 font-medium italic capitalize">{tenant.plan || "Trial"}</span>
        <div className="flex space-x-1">
           <StatusBadge status={tenant.status} />
        </div>
      </div>
    </td>
    <td className="py-4 pr-8 text-right">
       <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(tenant)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
             <Shield size={18} />
          </button>
          <button onClick={() => onDelete(tenant.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
             <Trash2 size={18} />
          </button>
       </div>
    </td>
  </tr>
);

const Empresas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  
  const { tenants, isLoading, createTenant, updateTenant, deleteTenant } = useTenants();

  const filteredTenants = tenants?.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveTenant = async (data) => {
    try {
      if (editingTenant) {
        await updateTenant.mutateAsync({ id: editingTenant.id, ...data });
      } else {
        await createTenant.mutateAsync(data);
      }
      setIsModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      alert("Error al guardar empresa: " + error.message);
    }
  };

  const openEdit = (tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteTenant = async (id) => {
    if (window.confirm("¿Estás seguro de suspender esta empresa? Los usuarios no podrán acceder.")) {
      await deleteTenant.mutateAsync(id);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter w-fit flex flex-col">
             <span className="bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent">Empresas</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gestión de organizaciones cliente</p>
        </div>
        <button 
          onClick={() => { setEditingTenant(null); setIsModalOpen(true); }}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-700 shadow-glow-emerald text-white active:scale-95 disabled:opacity-50"
        >
           <Plus size={18} />
           <span>Nueva Empresa</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar empresas por nombre o ID..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="flex items-center space-x-2">
             <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total: </span>
               <span className="text-xs font-black text-white ml-1">{filteredTenants?.length || 0}</span>
             </div>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Empresa</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Plan & Estado</th>
                 <th className="py-5 pr-8 text-right">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {isLoading ? (
                 <tr>
                    <td colSpan="3" className="py-24 text-center">
                       <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-emerald-500 border-r-transparent align-[-0.125em]" role="status"></div>
                       <p className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Cargando empresas...</p>
                    </td>
                 </tr>
               ) : filteredTenants?.length > 0 ? (
                 filteredTenants.map(t => <TenantRow key={t.id} tenant={t} onEdit={openEdit} onDelete={handleDeleteTenant} />)
               ) : (
                 <tr>
                   <td colSpan="3" className="py-32 text-center">
                      <div className="bg-slate-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                        <Building2 size={32} className="text-slate-800" />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No se encontraron empresas</p>
                      <p className="text-[10px] text-slate-600 mt-2 font-medium italic">Intenta con otros criterios de búsqueda o crea una nueva.</p>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      <TenantModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTenant(null); }} 
        tenant={editingTenant} 
        onSave={handleSaveTenant} 
      />
    </div>
  );
};

export default Empresas;
