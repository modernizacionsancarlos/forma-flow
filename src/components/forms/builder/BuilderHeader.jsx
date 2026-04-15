import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Settings, Infinity as InfinityIcon, X } from "lucide-react";

const BuilderHeader = ({ 
  title, setTitle, 
  description, setDescription, 
  acceptsResponses, setAcceptsResponses, 
  isPublic, setIsPublic, 
  onSave, saveStatus 
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <div className="flex flex-col border-b border-slate-800 bg-slate-950 shrink-0 relative z-50">
      {/* Header Fila 1 */}
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/forms" className="p-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
             <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-lg font-semibold text-white focus:outline-none placeholder:text-slate-600 w-96"
              placeholder="Nombre del formulario..."
            />
            <input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent text-sm text-slate-500 focus:outline-none placeholder:text-slate-600 mt-0.5 w-[32rem]"
              placeholder="Añade una descripción..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-700"
            type="button"
          >
            <Settings size={18} />
          </button>
          
          <button 
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save size={16} className={saveStatus === "saving" ? "animate-spin" : ""} />
            <span>{saveStatus === "saving" ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </div>

      {/* Header Fila 2 */}
      <div className="flex items-center px-14 pb-3 text-sm gap-8 text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <InfinityIcon size={16} className="text-slate-500" />
          <span>Límite de Respuestas:</span>
          <span className="text-white">Sin límite</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAcceptsResponses(!acceptsResponses)}>
          <div 
            className={`w-10 h-5 rounded-full relative transition-colors ${acceptsResponses ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${acceptsResponses ? 'left-[22px]' : 'left-0.5'}`}></div>
          </div>
          <span className={acceptsResponses ? "text-white" : ""}>Acepta Respuestas</span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
          <div 
            className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'left-[22px]' : 'left-0.5'}`}></div>
          </div>
          <span className={isPublic ? "text-white" : ""}>Hacer Público</span>
        </div>
      </div>

      {showSettingsModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-white font-semibold">Configuración del Formulario</h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Aceptar respuestas</p>
                  <p className="text-xs text-slate-500">Permite nuevos envíos en el portal público.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAcceptsResponses(!acceptsResponses)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${acceptsResponses ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${acceptsResponses ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-medium">Formulario público</p>
                  <p className="text-xs text-slate-500">Disponible sin autenticación para ciudadanos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${isPublic ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${isPublic ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="p-5 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderHeader;
