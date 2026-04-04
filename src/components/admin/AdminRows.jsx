import React from 'react';
import { Building2, Shield, Trash2, Users, Fingerprint, AlertCircle, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge } from './AdminUI';

export const TenantRow = ({ tenant, onEdit, onDelete }) => (
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

export const UserRow = ({ user, onDelete }) => (
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

export const AuditLogRow = ({ log }) => {
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
