import React, { useState } from "react";
import { Search, Plus, GitMerge, MoreVertical, X, Loader2, Trash2 } from "lucide-react";
import { useWorkflows } from "../api/useWorkflows";

const Workflows = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState("");

  const { workflows, isLoading, createWorkflow, deleteWorkflow } = useWorkflows();

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

  const handleDeleteWorkflow = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este workflow?")) {
      await deleteWorkflow.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Workflows</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Automatización y reglas de negocio</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Nuevo Workflow</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar automatizaciones..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Reglas Activas: </span>
             <span className="text-xs font-black text-white ml-1">{isLoading ? "..." : workflows.filter(w=>w.status==='active').length}</span>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nombre del Flujo</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Disparador (Trigger)</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Acciones</th>
                 <th className="py-5 pr-8 text-right"></th>
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
                    <tr key={wf.id} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="py-4 pl-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                            <GitMerge size={20} className={`transition-colors ${wf.status === 'active' ? 'text-slate-400 group-hover:text-cyan-500' : 'text-slate-600'}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${wf.status === 'active' ? 'text-white' : 'text-slate-500'}`}>{wf.name}</p>
                            <p className="text-[10px] font-mono text-slate-600">{wf.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-[10px] text-slate-400">
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">{wf.trigger}</span>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-slate-500/10 text-slate-400 border-slate-500/30">
                          {wf.actions || 0} Pasos
                        </span>
                      </td>
                      <td className="py-4 pr-8 text-right">
                         <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-600 hover:text-white rounded-lg transition-colors">
                                <MoreVertical size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteWorkflow(wf.id)}
                              className="p-2 text-slate-600 hover:text-rose-500 rounded-lg transition-colors"
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
