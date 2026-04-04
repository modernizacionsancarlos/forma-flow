import React from 'react';

export const StatusBadge = ({ status }) => {
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

export const StatCard = ({ title, value, subtext, icon, color }) => (
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
