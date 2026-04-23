import React, { useState } from "react";
import { Search, Plus, GitMerge, RefreshCw, X, Loader2, Trash2 } from "lucide-react";
import { useWorkflows } from "../api/useWorkflows";

const Workflows = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("");

  const { workflows, isLoading, createWorkflow, updateWorkflow, deleteWorkflow } = useWorkflows();

  const filteredWorkflows = workflows.filter(wf => 
    wf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newTrigger.trim()) return;

    try {
      await createWorkflow.mutateAsync({
        name: newName.trim(),
        trigger: newTrigger.trim(),
        actions: 1, // Default to 1
        status: "active"
      });
      setIsModalOpen(false);
      setNewName("");
      setNewTrigger("");
    } catch (error) {
      console.error("Error creating workflow:", error);
    }
  };

  const handleToggleStatus = async (workflow) => {
    const newStatus = workflow.status === "active" ? "inactive" : "active";
    await updateWorkflow.mutateAsync({
      id: workflow.id,
      status: newStatus
    });
  };

  const handleDeleteWorkflow = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este workflow?")) {
      await deleteWorkflow.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white animate-in fade-in duration-500">
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white">Workflows</h1>
            <p className="text-slate-500 text-sm mt-0.5">Automatización y reglas de negocio</p>
          </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          type="button"
          className="group flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Nuevo workflow</span>
        </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
           <div className="relative group w-full sm:max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors pointer-events-none" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar automatizaciones..."
                className="w-full bg-slate-800 border border-slate-700 pl-9 pr-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-0 transition-all placeholder:text-slate-500"
              />
           </div>
           
           <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-center sm:text-left whitespace-nowrap self-start sm:self-auto">
             <span className="text-[10px] font-semibold text-slate-500 uppercase">Reglas activas: </span>
             <span className="text-sm font-bold text-white ml-1">{isLoading ? "…" : workflows.filter(w=>w.status==='active').length}</span>
           </div>
        </div>

        <div className="overflow-x-auto -mx-1 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-950/30">
           <table className="w-full min-w-[640px] text-left text-sm border-collapse">
             <thead>
               <tr className="bg-slate-800/50 border-b border-slate-800">
                 <th className="py-3 sm:py-4 pl-3 sm:pl-5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Nombre del flujo</th>
                 <th className="py-3 sm:py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Disparador</th>
                 <th className="py-3 sm:py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                 <th className="py-3 sm:py-4 pr-3 sm:pr-5 text-right w-24"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Cargando workflows...
                    </td>
                  </tr>
                ) : filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      No se encontraron workflows
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map(wf => (
                    <tr key={wf.id} className="hover:bg-slate-800/40 border-b border-slate-800/50 transition-colors group">
                      <td className="py-3 sm:py-4 pl-3 sm:pl-5 align-top">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                            <GitMerge size={18} className={`transition-colors ${wf.status === 'active' ? 'text-slate-400 group-hover:text-cyan-500' : 'text-slate-600'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${wf.status === 'active' ? 'text-white' : 'text-slate-500'}`}>{wf.name}</p>
                            <p className="text-[10px] font-mono text-slate-600 truncate sm:hidden text-cyan-500/80">{wf.trigger}</p>
                            <p className="text-[10px] font-mono text-slate-600 truncate max-w-[180px] sm:max-w-none">{wf.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 font-mono text-[10px] text-slate-400 hidden sm:table-cell">
                        <span className="inline-block max-w-[200px] truncate align-top bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">{wf.trigger}</span>
                      </td>
                      <td className="py-3 sm:py-4 align-middle">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border bg-slate-500/10 text-slate-400 border-slate-500/30">
                          {wf.actions || 0} pasos
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 pr-3 sm:pr-5 text-right align-middle">
                         <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleToggleStatus(wf)}
                              disabled={updateWorkflow.isPending}
                              className={`p-2 rounded-lg transition-colors ${wf.status === 'active' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                              title={wf.status === 'active' ? "Desactivar" : "Activar"}
                            >
                                <RefreshCw size={16} className={updateWorkflow.isPending ? "animate-spin" : ""} />
                            </button>
                            <button 
                              onClick={() => handleDeleteWorkflow(wf.id)}
                              disabled={deleteWorkflow.isPending}
                              className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                                <Trash2 size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
             </tbody>
           </table>
        </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-cyan-500/5 blur-3xl rounded-full" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
               <GitMerge className="text-cyan-500" />
               <span className="text-white">Construir Workflow</span>
            </h2>
            <p className="text-slate-500 text-sm mb-8 italic">Automatiza procesos fácilmente.</p>
            
            <form onSubmit={handleCreateWorkflow} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre del Flujo</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Aprobación de Gastos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Disparador (Trigger)</label>
                <input 
                  type="text" 
                  required
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="Ej: Nuevo Envío, Cambio de Estado..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={createWorkflow.isPending || !newName.trim() || !newTrigger.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all"
                >
                  {createWorkflow.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> <span>Guardando...</span></>
                  ) : (
                    <span>Guardar Flujo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;
