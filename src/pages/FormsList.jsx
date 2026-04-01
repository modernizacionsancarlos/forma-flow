import React from "react";
import { Search, Folder, Plus, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useForms } from "../api/useForms";

const FormsList = () => {
  const { data: forms, isLoading } = useForms();

  return (
    <div className="flex flex-col h-full bg-[#060b13] p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Formularios</h1>
          <p className="text-sm text-slate-400">
            {isLoading ? "Cargando..." : `${forms?.length || 0} formularios en total`}
          </p>
        </div>
        <Link 
          to="/forms/new" 
          className="flex items-center space-x-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Nuevo Formulario</span>
        </Link>
      </div>

      {/* Filters Row */}
      <div className="flex space-x-4 mb-16">
        <div className="relative flex-1 max-w-2xl group border border-[#1e293b] rounded-lg bg-[#0f172a]/50 focus-within:border-[#10b981]/50 focus-within:ring-1 focus-within:ring-[#10b981]/50 transition-all">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#10b981]" />
          <input 
            type="text" 
            placeholder="Buscar formularios..." 
            className="w-full bg-transparent text-sm text-slate-200 pl-10 pr-4 py-2.5 outline-none placeholder:text-slate-500"
          />
        </div>
        
        <button className="flex items-center justify-between space-x-3 bg-[#0f172a]/50 border border-[#1e293b] hover:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors w-44">
          <span>Todos los estados</span>
          <ChevronDown size={16} className="text-slate-500" />
        </button>

        <button className="flex items-center justify-between space-x-3 bg-[#0f172a]/50 border border-[#1e293b] hover:border-slate-600 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors w-48">
          <span>Todas las empresas</span>
          <ChevronDown size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Main Content (Empty State) */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-[#1e293b]">
          <Folder size={32} className="text-slate-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-300 mb-2">No hay formularios</h3>
        <p className="text-sm text-slate-500">Crea tu primer formulario con el botón de arriba</p>
      </div>
    </div>
  );
};

export default FormsList;
