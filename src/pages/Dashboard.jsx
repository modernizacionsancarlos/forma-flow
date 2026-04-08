import React, { useState } from "react";
import { 
  BarChart3, 
  Users, 
  Database, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Filter,
  LayoutDashboard
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useAuth } from "../lib/AuthContext";
import { useGlobalStats, useRecentActivity } from "../api/useGlobalStats";
import { useTenants } from "../api/useTenants";
import Guard from "../components/auth/Guard";
import { PERMISSIONS } from "../lib/permissions";

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-${color === 'amber' ? 'yellowLine' : color}-500 blur-3xl`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300 origin-left">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
      </div>
      <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-500 transition-all`}>
        {React.createElement(icon, { size: 24 })}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, time, type }) => (
  <div className="flex items-center space-x-4 p-4 border-b border-slate-800/30 last:border-0 hover:bg-slate-800/20 transition-colors rounded-xl">
    <div className={`w-2 h-2 rounded-full ${
      type === 'sync' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
      type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`} />
    <div className="flex-1 overflow-hidden">
      <p className="text-sm font-bold text-slate-200 truncate" title={title}>{title}</p>
      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{time}</p>
    </div>
    <div className="text-slate-600 hidden xs:block">
      <Clock size={14} />
    </div>
  </div>
);

const Dashboard = () => {
  const { currentProfile } = useAuth();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const { tenants } = useTenants();

  // Determine which tenantId to use for stats
  // If super_admin, use selectedTenant (can be null for global)
  // Otherwise, strictly use currentProfile.tenantId
  const isSuperAdmin = currentProfile?.role === 'super_admin';
  const effectiveTenantId = isSuperAdmin ? selectedTenant : currentProfile?.tenantId;

  const { data: stats } = useGlobalStats(effectiveTenantId);
  const { data: activity, isLoading: activityLoading } = useRecentActivity(effectiveTenantId);

  const chartData = stats?.chartData || [];
  const statusData = stats?.statusDistribution || [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Enterprise v2.2</span>
            <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
            <span className="text-xs font-bold text-slate-400 capitalize">
              {effectiveTenantId || "Infraestructura Global"}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            System <span className="text-emerald-500">Overview</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">
            {effectiveTenantId ? `Panel de control: ${effectiveTenantId}` : "Rendimiento global operativo."}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Guard permission={PERMISSIONS.MANAGE_TENANTS} fallback={null}>
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 space-x-2">
              <Filter size={14} className="text-slate-500" />
              <select 
                value={selectedTenant || ""}
                onChange={(e) => setSelectedTenant(e.target.value || null)}
                className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none appearance-none cursor-pointer"
              >
                <option value="">Vista Global</option>
                {tenants?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </Guard>
          
          <div className="flex space-x-2 overflow-x-auto pb-1">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-2 flex items-center space-x-3 whitespace-nowrap">
             <div className="flex -space-x-1">
               <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900" />
               <div className="w-6 h-6 rounded-full bg-emerald-500 border border-slate-900" />
             </div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               {stats?.totalUsers || 0} Usuarios Activos
             </span>
          </div>
        </div>
      </div>
    </div>

    {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tasa de Resolución" 
          value={`${stats?.resolutionRate || 0}%`} 
          subtext="Efectividad de despacho"
          icon={CheckCircle2} 
          color="emerald" 
        />
        <StatCard 
          title="Tiempo Promedio" 
          value={`${stats?.avgResolutionTime || 0}h`} 
          subtext="Media de resolución" 
          icon={Clock} 
          color="blue" 
        />
        <StatCard 
          title="Fuera de Término" 
          value={stats?.overdueCount || 0} 
          subtext="Pendientes > 48hs" 
          icon={AlertCircle} 
          color={stats?.overdueCount > 0 ? "red" : "slate"} 
        />
        <StatCard 
          title="Total Trámites" 
          value={stats?.totalSubmissions || 0} 
          subtext={`+${stats?.recentSubmissionsCount || 0} esta semana`} 
          icon={Database} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                 <BarChart3 size={18} className="text-emerald-500" />
                 <span>Actividad del Sistema</span>
               </h3>
               <p className="text-xs text-slate-500 font-medium italic italic pb-2">Tráfico detectado esta semana.</p>
             </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  cursor={{ fill: '#1e293b', radius: 8 }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-800/50">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Picos de Uso</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                 <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Promedio Regional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Feed & Status Distribution */}
        <div className="space-y-8">
            {/* Status Pie Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2 mb-6">
                 <Zap size={16} className="text-amber-500" />
                 <span>Estado de Gestiones</span>
               </h3>
               <div className="h-[200px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={statusData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {statusData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-4">
                 {statusData.map((item, i) => (
                   <div key={item.name} className="flex items-center space-x-2">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                     <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{item.name}</span>
                     <span className="text-[10px] font-black text-white ml-auto">{item.value}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Top Forms Ranking */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2 mb-6">
                 <TrendingUp size={16} className="text-emerald-500" />
                 <span>Formularios más Activos</span>
               </h3>
               <div className="space-y-5">
                 {stats?.submissionsPerForm?.length > 0 ? (
                   stats.submissionsPerForm.map((form) => {
                     const percentage = Math.round((form.value / (stats.totalSubmissions || 1)) * 100);
                     return (
                       <div key={form.name} className="space-y-2">
                         <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-white uppercase truncate max-w-[150px]">{form.name}</span>
                            <span className="text-[10px] font-black text-slate-500">{form.value}</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                              style={{ width: `${percentage}%` }} 
                            />
                         </div>
                       </div>
                     );
                   })
                 ) : (
                   <p className="text-[10px] font-bold text-slate-600 uppercase text-center py-4">No hay datos de formularios</p>
                 )}
               </div>
            </div>

           {/* Event Log */}
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col h-[350px]">
              <div className="mb-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                  <Activity size={18} className="text-blue-500" />
                  <span>Log de Auditoría</span>
                </h3>
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {activityLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Clock size={24} className="animate-spin text-slate-700" />
                  </div>
                ) : activity?.length > 0 ? (
                  activity.map(item => (
                    <ActivityItem key={item.id} title={item.title} time={item.time} type={item.type} />
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50 px-4">
                    <Database size={32} className="mb-2 text-slate-700" />
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sin registros</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
