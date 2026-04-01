import React, { useState } from "react";
import { Plus, Users, Search, X, Trash2, Mail, Fingerprint } from "lucide-react";
import { useUsers } from "../api/useUsers";
import { useTenants } from "../api/useTenants";

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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium disabled:opacity-50 text-white"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-bold disabled:opacity-50 text-white"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none font-bold disabled:opacity-50 text-white"
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
             <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-glow-cyan flex items-center justify-center space-x-2 disabled:opacity-50">
               {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
               <span>{isSaving ? "Registrando..." : "Registrar"}</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserRow = ({ user, onDelete }) => (
  <tr className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors group">
    <td className="py-4 pl-8">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
           <Users size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">{user.email || "Usuario sin email"}</p>
          <div className="flex items-center space-x-1">
             <Fingerprint size={12} className="text-slate-600" />
             <p className="text-xs font-mono text-slate-500">{user.id}</p>
          </div>
        </div>
      </div>
    </td>
    <td className="py-4 font-mono text-xs text-slate-400 italic">
       <span className="bg-slate-900 px-2 py-1 rounded-md border border-white/5">{user.tenantId || "Global / Central"}</span>
    </td>
    <td className="py-4">
       <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${
         user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
         user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/30' :
         'bg-slate-500/10 text-slate-500 border-slate-500/30'
       }`}>
         {user.role || "User"}
       </span>
    </td>
    <td className="py-4 pr-8 text-right">
       <button onClick={() => onDelete(user.id)} className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
          <Trash2 size={18} />
       </button>
    </td>
  </tr>
);

const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  const { users, isLoading: usersLoading, createUser, deleteUser } = useUsers();
  const { tenants } = useTenants();

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveUser = async (data) => {
    try {
      await createUser.mutateAsync(data);
      setIsUserModalOpen(false);
    } catch (error) {
      alert("Error al vincular usuario: " + error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este vínculo de usuario?")) {
      await deleteUser.mutateAsync(id);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter w-fit flex flex-col">
             <span className="bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Usuarios</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Directorio global y vinculaciones</p>
        </div>
        <button 
          onClick={() => setIsUserModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-blue-600 hover:bg-blue-700 shadow-glow-cyan text-white active:scale-95 disabled:opacity-50"
        >
           <Plus size={18} />
           <span>Vincular Usuario</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por email o ID..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="flex items-center space-x-2">
             <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total: </span>
               <span className="text-xs font-black text-white ml-1">{filteredUsers?.length || 0}</span>
             </div>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identidad</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tenant Asignado</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Privilegios</th>
                 <th className="py-5 pr-8 text-right">Acciones</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {usersLoading ? (
                 <tr>
                    <td colSpan="4" className="py-24 text-center">
                       <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-blue-500 border-r-transparent align-[-0.125em]" role="status"></div>
                       <p className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Analizando directorio...</p>
                    </td>
                 </tr>
               ) : filteredUsers?.length > 0 ? (
                 filteredUsers.map(u => <UserRow key={u.id} user={u} onDelete={handleDeleteUser} />)
               ) : (
                 <tr>
                   <td colSpan="4" className="py-32 text-center">
                      <div className="bg-slate-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                        <Users size={32} className="text-slate-800" />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sin usuarios encontrados</p>
                      <p className="text-[10px] text-slate-600 mt-2 font-medium italic">Registra o busca con otro nombre.</p>
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUser}
        tenants={tenants}
      />
    </div>
  );
};

export default Usuarios;
