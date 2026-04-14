import React, { useState } from "react";
import { Search, Plus, MapPin, RefreshCw, X, Loader2, Trash2 } from "lucide-react";
import { useAreas } from "../api/useAreas";
import { useAuth } from "../lib/AuthContext";

const Areas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");

  const { areas, isLoading, createArea, updateArea, deleteArea } = useAreas();
  const { claims } = useAuth();

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateArea = async (e) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    try {
      await createArea.mutateAsync({
        name: newAreaName.trim(),
        users: 0,
        status: "active",
        tenant: claims?.tenantName || "Sin Asignar"
      });
      setIsModalOpen(false);
      setNewAreaName("");
    } catch (error) {
      console.error("Error creating area:", error);
    }
  };

  const handleToggleStatus = async (area) => {
    const newStatus = area.status === "active" ? "paused" : "active";
    await updateArea.mutateAsync({
      id: area.id,
      status: newStatus
    });
  };

  const handleDeleteArea = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta área?")) {
      await deleteArea.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Áreas</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gestión de departamentos y ubicaciones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Nueva Área</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative group w-full max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar áreas o departamentos..."
              className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
            />
          </div>

          <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Áreas: </span>
            <span className="text-xs font-black text-white ml-1">{isLoading ? "..." : filteredAreas.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nombre del Área</th>
                <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Empresa (Tenant)</th>
                <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Usuarios Asignados</th>
                <th className="py-5 pr-8 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Cargando áreas...
                  </td>
                </tr>
              ) : filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No se encontraron áreas
                  </td>
                </tr>
              ) : (
                filteredAreas.map(area => (
                  <tr key={area.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                          <MapPin size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{area.name}</p>
                          <p className="text-[10px] font-mono text-slate-600">{area.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[10px] text-slate-400">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">{area.tenant || 'General'}</span>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-slate-500/10 text-slate-400 border-slate-500/30">
                        {area.users || 0} Miembros
                      </span>
                    </td>
                    <td className="py-4 pr-8 text-right">
                      <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(area)}
                          disabled={updateArea.isPending}
                          className={`p-2 rounded-lg transition-colors ${area.status === 'active' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                          title={area.status === 'active' ? "Pausar" : "Activar"}
                        >
                          <RefreshCw size={16} className={updateArea.isPending ? "animate-spin" : ""} />
                        </button>
                        <button
                          onClick={() => handleDeleteArea(area.id)}
                          disabled={deleteArea.isPending}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-rose-500/5 blur-3xl rounded-full" />

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
              <MapPin className="text-rose-500" />
              <span className="text-white">Registrar Área</span>
            </h2>
            <p className="text-slate-500 text-sm mb-8 italic">Define un nuevo segmento organizacional.</p>

            <form onSubmit={handleCreateArea} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre del Área</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="Ej: Recursos Humanos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all font-medium"
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
                  disabled={createArea.isPending || !newAreaName.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all"
                >
                  {createArea.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> <span>Guardando...</span></>
                  ) : (
                    <span>Guardar Área</span>
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

export default Areas;
