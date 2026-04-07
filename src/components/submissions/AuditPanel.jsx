import React from "react";
import { X, ShieldCheck, Database, History, Check, Download, AlertCircle, Archive, HelpCircle, RotateCcw } from "lucide-react";
import { useWorkflowEngine, STATUS_CONFIG, WORKFLOW_ACTIONS } from "../../api/useWorkflowEngine";
import AuditTimeline from "./AuditTimeline";

const ICON_MAP = {
  check: Check,
  x: X,
  'help-circle': HelpCircle,
  archive: Archive,
  'rotate-ccw': RotateCcw,
  'shield-check': ShieldCheck,
  'alert-circle': AlertCircle
};

const AuditPanel = ({ 
  selectedSubmission, 
  onClose, 
  flattenedFields, 
  onStatusUpdated, // Pass callback instead of updateStatus directly
  generatePDF 
}) => {
  const { executeTransition, loading } = useWorkflowEngine();

  if (!selectedSubmission) return (
    <div className="w-0 border-0 opacity-0 translate-x-10 overflow-hidden bg-slate-900 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
  );

  const currentStatus = selectedSubmission.status || 'pending_review';
  const statusMeta = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending_review;
  const availableActionKeys = statusMeta.actions || [];

  const handleAction = async (actionKey) => {
    const result = await executeTransition(selectedSubmission, actionKey);
    if (result.success && onStatusUpdated) {
      onStatusUpdated(result.newStatus);
    }
  };

  return (
    <div className="w-[480px] border border-slate-800 bg-slate-900 rounded-[2.5rem] shadow-dark-2xl flex flex-col group relative transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-100 animate-in slide-in-from-right-10">
      <div className="flex flex-col h-full w-full">
         <div className="p-8 bg-slate-950/60 border-b border-slate-800 flex justify-between items-start backdrop-blur-xl shrink-0">
            <div className="space-y-3">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                   <ShieldCheck size={14} />
                   <span>Dossier de Auditoría</span>
                </span>
                <h3 className="text-2xl font-black text-white tracking-tighter leading-none">#{selectedSubmission.id.substring(0, 8)}</h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 hover:border-slate-700 active:scale-90"
            >
               <X size={18} />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
            {/* Estado Actual */}
            <div className={`p-4 rounded-2xl border ${statusMeta.color} flex items-center justify-between`}>
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full bg-current opacity-10 flex items-center justify-center">
                    <History size={16} />
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block opacity-60">Estado Actual</span>
                    <span className="text-xs font-black uppercase tracking-tighter">{statusMeta.label}</span>
                 </div>
               </div>
            </div>

            {/* Meta Global */}
            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner">
                  <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">Entidad</span>
                  <span className="text-xs text-white font-black truncate block italic">{selectedSubmission.tenant_id}</span>
               </div>
               <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner">
                  <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">Autor</span>
                  <span className="text-xs text-white font-black truncate block">{selectedSubmission.created_by?.substring(0, 12) || "Public"}</span>
               </div>
            </div>

            {/* Datos Técnicos */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-3">
                    <Database size={14} />
                    <span>Evidencia Capturada</span>
                 </h4>
               </div>
               <div className="grid grid-cols-1 gap-2 border border-slate-800 rounded-3xl overflow-hidden bg-slate-950/30">
                  {Object.entries(selectedSubmission.data || {}).map(([key, val], idx, arr) => {
                    const field = flattenedFields.find(f => f.id === key);
                    const isLast = idx === arr.length - 1;
                    return (
                     <div key={key} className={`flex flex-col p-4 bg-transparent hover:bg-slate-900/50 transition-colors group/item ${!isLast ? 'border-b border-slate-800/50' : ''}`}>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/item:text-emerald-500 transition-colors">{field?.label || key}</span>
                        <span className="text-sm text-slate-200 font-black tracking-tight break-words">{String(val)}</span>
                     </div>
                    );
                  })}
               </div>
            </div>

             {/* Línea de Tiempo Operativa */}
             <div className="pt-8 border-t border-slate-800">
               <AuditTimeline history={selectedSubmission.history} />
             </div>

            {/* Workflow Controls */}
            <div className="pt-8 border-t border-slate-800 space-y-5">
               <div className="flex items-center space-x-3">
                  <History size={14} className="text-slate-600" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ejecución de Workflow</span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  {availableActionKeys.map(actionKey => {
                    const action = WORKFLOW_ACTIONS[actionKey];
                    if (!action) return null;
                    
                    const ActionIcon = actionKey === 'approve' ? ShieldCheck : actionKey === 'reject' ? X : actionKey === 'request_info' ? HelpCircle : actionKey === 'archive' ? Archive : RotateCcw;

                    return (
                      <button 
                        key={actionKey}
                        onClick={() => handleAction(actionKey)}
                        disabled={loading}
                        className={`flex items-center justify-center space-x-2 py-4 border-2 rounded-2xl text-[10px] font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed ${
                          action.color === 'emerald' ? "bg-emerald-600/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-600 hover:text-white" :
                          action.color === 'red' ? "bg-rose-600/5 text-rose-500 border-rose-500/10 hover:bg-rose-600 hover:text-white" :
                          action.color === 'cyan' ? "bg-cyan-600/5 text-cyan-500 border-cyan-500/10 hover:bg-cyan-600 hover:text-white" :
                          "bg-slate-600/5 text-slate-500 border-slate-500/10 hover:bg-slate-600 hover:text-white"
                        }`}
                      >
                         <ActionIcon size={16} />
                         <span>{action.label}</span>
                      </button>
                    );
                  })}
               </div>
            </div>
         </div>
         
         <div className="p-6 bg-slate-950/80 border-t border-slate-800 backdrop-blur-xl shrink-0">
            <button 
              onClick={generatePDF}
              className="w-full py-4 border border-slate-700 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center space-x-3 hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95"
            >
               <Download size={16} />
               <span>Descargar Acta (PDF)</span>
            </button>
         </div>
      </div>
    </div>
  );
};

export default AuditPanel;
