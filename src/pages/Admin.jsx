import React, { useState } from "react";
import { Plus, Users, Building2, Shield, MoreVertical, Search, Filter, X, Check, AlertCircle, Trash2, Mail, Fingerprint, Activity, Globe } from "lucide-react";
import { useTenants } from "../api/useTenants";
import { useUsers } from "../api/useUsers";
import { useAuditLogs } from "../api/useAuditLogs";

import { StatCard } from '../components/admin/AdminUI';
import { UserModal, TenantModal } from '../components/admin/AdminModals';
import { TenantRow, UserRow, AuditLogRow } from '../components/admin/AdminRows';

const Admin = () => {
  const [activeTab, setActiveTab] = useState("tenants");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  
   const { tenants, isLoading: tenantsLoading, createTenant, updateTenant, deleteTenant } = useTenants();
  const { users, isLoading: usersLoading, createUser, deleteUser } = useUsers();
  const { data: auditLogs, isLoading: logsLoading } = useAuditLogs();

  // Filtered lists
  const filteredTenants = tenants?.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = auditLogs?.filter(l => 
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.performer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      alert("Error al guardar tenant: " + error.message);
    }
  };

  const handleSaveUser = async (data) => {
    try {
      await createUser.mutateAsync(data);
      setIsUserModalOpen(false);
    } catch (error) {
      alert("Error al vincular usuario: " + error.message);
    }
  };

  const openEdit = (tenant) => {
    setEditingTenant(tenant);
    setIsModalOpen(true);
  };

  const handleDeleteTenant = async (id) => {
    if (window.confirm("¿Estás seguro de suspender este tenant? Los usuarios no podrán acceder.")) {
      await deleteTenant.mutateAsync(id);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este vínculo de usuario?")) {
      await deleteUser.mutateAsync(id);
    }
  };

   const isLoading = tenantsLoading || usersLoading || logsLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Central Admin</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic italic">Infraestructura multitenant global</p>
        </div>
         <button 
          onClick={() => { 
            if(activeTab === 'tenants') { setEditingTenant(null); setIsModalOpen(true); }
            else if(activeTab === 'users') { setIsUserModalOpen(true); }
          }}
          className={`group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
            activeTab === 'tenants' 
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
              : activeTab === 'users'
              ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              : 'hidden'
          } text-white`}
        >
           <Plus size={18} className="group-hover:rotate-90 transition-transform" />
           <span>{activeTab === "tenants" ? "Nuevo Tenant" : "Vincular Usuario"}</span>
        </button>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 pb-4">
        <StatCard 
          title="Total Tenants" 
          value={tenants?.length || 0} 
          subtext="Organizaciones registradas" 
          icon={Building2} 
          color="emerald" 
        />
        <StatCard 
          title="Usuarios Globales" 
          value={users?.length || 0} 
          subtext="Cuentas activas en la red" 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          title="Eventos de Auditoría" 
          value={auditLogs?.length || 0} 
          subtext="Logs inmutables capturados" 
          icon={Shield} 
          color="purple" 
        />
         <StatCard 
          title="Estado del Clúster" 
          value="Saludable" 
          subtext="Todas las instancias online" 
          icon={Activity} 
          color="amber" 
        />
      </div>

      <div className="flex space-x-8 border-b border-white/5">
         <button 
           onClick={() => setActiveTab("tenants")}
           className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'tenants' ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
         >
           Lista de Tenants
           {activeTab === 'tenants' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>}
         </button>
          <button 
            onClick={() => setActiveTab("users")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'users' ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
         >
           Usuarios Globales
           {activeTab === 'users' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>}
         </button>
         <button 
            onClick={() => setActiveTab("audit")}
            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'audit' ? 'text-purple-500' : 'text-slate-500 hover:text-slate-300'}`}
         >
           Auditoría
           {activeTab === 'audit' && <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>}
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
                placeholder={
                  activeTab === 'tenants' ? "Filtrar organizaciones..." : 
                  activeTab === 'users' ? "Buscar por email o ID..." :
                  "Criterios de auditoría..."
                }
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="flex items-center space-x-2">
             <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Resultados: </span>
               <span className="text-xs font-black text-white ml-1">
                 {activeTab === 'tenants' ? filteredTenants?.length : 
                  activeTab === 'users' ? filteredUsers?.length : 
                  filteredLogs?.length}
               </span>
             </div>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                   {activeTab === 'tenants' ? 'Organización' : activeTab === 'users' ? 'Sujeto Identificado' : 'Acción Realizada'}
                 </th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                   {activeTab === 'tenants' ? 'Estrategia & Status' : activeTab === 'users' ? 'Tenant ID' : 'Responsable'}
                 </th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                   {activeTab === 'tenants' ? 'Métricas' : activeTab === 'users' ? 'Privilegios' : 'Marca de Tiempo'}
                 </th>
                 <th className="py-5 pr-8 text-right"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {isLoading ? (
                 <tr>
                    <td colSpan="4" className="py-24 text-center">
                       <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-emerald-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                       <p className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Analizando Registro Multitenant...</p>
                    </td>
                 </tr>
               ) : activeTab === 'tenants' ? (
                 filteredTenants?.length > 0 ? (
                   filteredTenants.map(t => <TenantRow key={t.id} tenant={t} onEdit={openEdit} onDelete={handleDeleteTenant} />)
                 ) : (
                   <tr>
                     <td colSpan="4" className="py-32 text-center">
                        <div className="bg-slate-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                          <Building2 size={32} className="text-slate-800" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No se encontraron entidades</p>
                        <p className="text-[10px] text-slate-600 mt-2 font-medium italic">Intenta con otros criterios de búsqueda.</p>
                     </td>
                   </tr>
                 )
               ) : activeTab === 'users' ? (
                 filteredUsers?.length > 0 ? (
                   filteredUsers.map(u => <UserRow key={u.id} user={u} onDelete={handleDeleteUser} />)
                 ) : (
                   <tr>
                     <td colSpan="4" className="py-32 text-center">
                        <div className="bg-slate-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                          <Users size={32} className="text-slate-800" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sin usuarios vinculados</p>
                        <p className="text-[10px] text-slate-600 mt-2 font-medium italic">Registra un usuario para comenzar.</p>
                     </td>
                   </tr>
                 )
               ) : (
                 filteredLogs?.length > 0 ? (
                   filteredLogs.map(log => <AuditLogRow key={log.id} log={log} />)
                 ) : (
                   <tr>
                     <td colSpan="4" className="py-32 text-center">
                        <div className="bg-slate-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                          <AlertCircle size={32} className="text-slate-800" />
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sin actividad registrada</p>
                        <p className="text-[10px] text-slate-600 mt-2 font-medium italic">Las acciones administrativas aparecerán aquí.</p>
                     </td>
                   </tr>
                 )
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

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        tenants={tenants}
      />
    </div>
  );
};

export default Admin;
