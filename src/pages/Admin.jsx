import React, { useState } from "react";
import { Plus, Users, Building2, Shield, MoreVertical, Search, Filter, X, Check, AlertCircle, Trash2, Mail, Fingerprint, Activity, Globe } from "lucide-react";
import { useTenants } from "../api/useTenants";
import { useUsers } from "../api/useUsers";
import { useAuditLogs } from "../api/useAuditLogs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all duration-300 shadow-2xl">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-${color === 'amber' ? 'yellow' : color}-500 blur-3xl`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white group-hover:scale-105 transition-transform duration-300">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-[10px] text-slate-400 mt-2 font-medium italic">{subtext}</p>
      </div>
      <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 text-${color}-500 shadow-xl group-hover:shadow-${color}-500/10 transition-all border-b-2 border-b-${color}-500/20`}>
        {React.createElement(icon, { size: 20 })}
      </div>
    </div>
  </div>
);

const UserModal = ({ isOpen, onClose, onSave, tenants, isSaving }) => {
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

const TenantModal = ({ isOpen, onClose, tenant, onSave, isSaving }) => {
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

const TenantRow = ({ tenant, onEdit, onDelete }) => (
  <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group">
    <td className="py-4 pl-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
           <Building2 size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{tenant.name || "Tenant Desconocido"}</p>
          <p className="text-[10px] font-mono text-slate-600">{tenant.id}</p>
        </div>
      </div>
    </td>
    <td className="py-4">
      <div className="flex flex-col">
        <span className="text-xs text-white pb-1 font-medium italic capitalize">{tenant.plan || "Trial"}</span>
        <div className="flex space-x-1">
           <StatusBadge status={tenant.status} />
        </div>
      </div>
    </td>
    <td className="py-4">
      <div className="flex items-center space-x-2 text-slate-400">
         <Users size={14} />
         <span className="text-xs font-medium">{tenant.userCount || 0} / {tenant.userLimit || "10"}</span>
      </div>
    </td>
    <td className="py-4 pr-4 text-right">
       <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(tenant)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all">
             <Shield size={16} />
          </button>
          <button onClick={() => onDelete(tenant.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
             <Trash2 size={16} />
          </button>
       </div>
    </td>
  </tr>
);

const UserRow = ({ user, onDelete }) => (
  <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group">
    <td className="py-4 pl-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
           <Users size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{user.email || "Usuario sin email"}</p>
          <div className="flex items-center space-x-1">
             <Fingerprint size={10} className="text-slate-600" />
             <p className="text-[10px] font-mono text-slate-600">{user.id}</p>
          </div>
        </div>
      </div>
    </td>
    <td className="py-4 font-mono text-[10px] text-slate-400 italic">
       <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">{user.tenantId || "Global / Central"}</span>
    </td>
    <td className="py-4">
       <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
         user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
         user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' :
         'bg-slate-500/10 text-slate-500 border-slate-500/30'
       }`}>
         {user.role || "User"}
       </span>
    </td>
    <td className="py-4 pr-4 text-right">
       <button onClick={() => onDelete(user.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
          <Trash2 size={16} />
       </button>
    </td>
  </tr>
);

const AuditLogRow = ({ log }) => {
  const getActionColor = (action) => {
    if (action.includes("create")) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (action.includes("suspend") || action.includes("delete")) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (action.includes("update")) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  };

  const formatDate = (ts) => {
    if (!ts) return "---";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return format(date, "d MMM, HH:mm", { locale: es });
  };

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group">
      <td className="py-4 pl-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
             <AlertCircle size={14} className="text-slate-500" />
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${getActionColor(log.action)}`}>
              {log.action.replace("_", " ")}
            </span>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              {log.tenant_name || log.tenant_id || log.user_email || "Recurso Sistema"}
            </p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
             <span className="text-[8px] font-bold text-slate-300">{log.performer_name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-300">{log.performer_name}</p>
            <p className="text-[9px] text-slate-600 font-mono tracking-tighter">{log.performer_id?.substring(0, 8)}...</p>
          </div>
        </div>
      </td>
      <td className="py-4">
        <p className="text-[11px] font-medium text-slate-400">{formatDate(log.timestamp)}</p>
      </td>
      <td className="py-4 pr-4 text-right">
         <button className="p-2 text-slate-700 hover:text-slate-400 transition-colors">
            <MoreVertical size={14} />
         </button>
      </td>
    </tr>
  );
};

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
