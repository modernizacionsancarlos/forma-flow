import React from "react";
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
  Globe
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { useAuth } from "../lib/AuthContext";
import { useSubmissions } from "../api/useSubmissions";
import { useGlobalStats, useRecentActivity } from "../api/useGlobalStats";

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-${color === 'amber' ? 'yellow' : color}-500 blur-3xl`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white group-hover:scale-105 transition-transform duration-300">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p className="text-[10px] text-slate-400 mt-2 font-medium italic">{subtext}</p>
      </div>
      <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 text-${color}-500 shadow-xl group-hover:shadow-${color}-500/10 transition-all`}>
        {React.createElement(icon, { size: 20 })}
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
  const { claims } = useAuth();
  const { queueCount, isSyncing } = useSubmissions();
  const { data: stats } = useGlobalStats();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  const chartData = stats?.chartData || [
    { name: 'Mon', count: 40 },
    { name: 'Tue', count: 65 },
    { name: 'Wed', count: 45 },
    { name: 'Thu', count: 90 },
    { name: 'Fri', count: 75 },
    { name: 'Sat', count: 55 },
    { name: 'Sun', count: 80 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Enterprise v2.1</span>
            <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
            <span className="text-xs font-bold text-slate-400 capitalize">{claims.tenantId || "Infraestructura Global"}</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            System <span className="text-emerald-500">Overview</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Rendimiento global operativo.</p>
        </div>
        
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Submissions" 
          value={stats?.totalSubmissions || 0} 
          subtext={`+${stats?.recentSubmissionsCount || 0} en los últimos 7 días`}
          icon={BarChart3} 
          color="emerald" 
        />
        <StatCard 
          title="Pendings Sync" 
          value={queueCount} 
          subtext={isSyncing ? "Procesando cola..." : "Cache local persistido"} 
          icon={Database} 
          color={queueCount > 0 ? "amber" : "slate"} 
        />
        <StatCard 
          title="Clients & Tenants" 
          value={stats?.totalTenants || 0} 
          subtext="Ecosistema Multitenant" 
          icon={Globe} 
          color="blue" 
        />
        <StatCard 
          title="Real-Time Node" 
          value="Online" 
          subtext="Conexión estable v2" 
          icon={Activity} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-md flex flex-col min-h-[450px]">
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

        {/* Real-time Feed */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-md flex flex-col h-[550px] lg:h-auto">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center space-x-2">
              <Activity size={18} className="text-blue-500" />
              <span>Event Log</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium italic">Sincronizaciones en vivo.</p>
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
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No hay actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
