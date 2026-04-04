import React, { useState } from "react";
import { Search, Download, FileSpreadsheet, X, Loader2, Trash2 } from "lucide-react";
import { useExports } from "../api/useExports";
import { useForms } from "../api/useForms";
import { db, storage } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as XLSX from "xlsx";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Exportaciones = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newFormat, setNewFormat] = useState("XLSX");
  const [selectedFormId, setSelectedFormId] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const { exportsList, isLoading, createExport, deleteExport } = useExports();
  const { forms } = useForms();

  const filteredExports = exportsList.filter(exp => 
    exp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateExport = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !selectedFormId) return;

    setIsExporting(true);
    try {
      // 1. Fetch Submissions for the specific form
      const q = query(collection(db, "submissions"), where("form_id", "==", selectedFormId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Transform the complex values object into flat columns for Excel
        ...doc.data().values
      }));

      // Cleanup internal fields from export
      const cleanedData = data.map(item => {
        const copy = { ...item };
        delete copy.values;
        delete copy.metadata;
        return copy;
      });

      let downloadUrl = "";
      let fileName = `${newName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

      if (newFormat === "JSON") {
         const jsonContent = JSON.stringify(cleanedData, null, 2);
         const blob = new Blob([jsonContent], { type: "application/json" });
         downloadUrl = await uploadAndGetUrl(blob, `${fileName}.json`);
      } else {
         // XLSX Export logic
         const worksheet = XLSX.utils.json_to_sheet(cleanedData);
         const workbook = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(workbook, worksheet, "Respuestas");
         
         const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
         const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
         downloadUrl = await uploadAndGetUrl(blob, `${fileName}.xlsx`);
      }

      // 2. Save the metadata record in Firestore
      await createExport.mutateAsync({
        name: newName.trim(),
        format: newFormat,
        size: `${(cleanedData.length)} filas`,
        downloadUrl,
        formId: selectedFormId,
        formName: forms.find(f => f.id === selectedFormId)?.title || "Formulario"
      });

      setIsModalOpen(false);
      setNewName("");
      setSelectedFormId("");
    } catch (error) {
      console.error("Error creating export:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const uploadAndGetUrl = async (blob, path) => {
    const fileRef = ref(storage, `exports/${path}`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const handleDeleteExport = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este reporte?")) {
      await deleteExport.mutateAsync(id);
    }
  };

  const getFormatBadge = (format) => {
    switch(format) {
      case 'CSV': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'JSON': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'XLSX': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Exportaciones</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gestión de datos salientes y reportes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
        >
          <Download size={18} className="group-hover:translate-y-1 transition-transform" />
          <span>Nueva Exportación</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar reportes..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Reportes: </span>
             <span className="text-xs font-black text-white ml-1">{isLoading ? "..." : filteredExports.length}</span>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Archivo Generado</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Formato / Tamaño</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fecha</th>
                 <th className="py-5 pr-8 text-right"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Cargando exportaciones...
                    </td>
                  </tr>
                ) : filteredExports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      No se encontraron reportes
                    </td>
                  </tr>
                ) : (
                  filteredExports.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="py-4 pl-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                            <FileSpreadsheet size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{exp.name}</p>
                            <p className="text-[10px] font-mono text-slate-600">{exp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                         <div className="flex items-center space-x-2">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${getFormatBadge(exp.format)}`}>
                             {exp.format}
                           </span>
                           <span className="text-[10px] font-mono text-slate-500">{exp.size || "Procesando..."}</span>
                         </div>
                      </td>
                      <td className="py-4">
                        <span className="text-[11px] font-medium text-slate-400">
                           {exp.created_date ? formatDistanceToNow(exp.created_date.toDate(), { locale: es, addSuffix: true }) : 'Desconocido'}
                        </span>
                      </td>
                      <td className="py-4 pr-8 text-right">
                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {exp.downloadUrl && (
                              <a 
                                href={exp.downloadUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 text-slate-600 hover:text-emerald-500 rounded-lg transition-colors"
                                title="Descargar"
                              >
                                <Download size={16} />
                              </a>
                            )}
                            <button 
                              onClick={() => handleDeleteExport(exp.id)}
                              className="p-2 text-slate-600 hover:text-rose-500 rounded-lg transition-colors"
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
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-orange-500/5 blur-3xl rounded-full" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
               <Download className="text-orange-500" />
               <span className="text-white">Generar Exportación</span>
            </h2>
            <p className="text-slate-500 text-sm mb-8 italic">Extrae datos del sistema en el formato necesario.</p>
            
            <form onSubmit={handleCreateExport} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre del Reporte</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Auditoría Anual"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Formulario a Exportar</label>
                <select 
                  required
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium appearance-none"
                >
                  <option value="">Selecciona un formulario...</option>
                  {forms?.map(form => (
                    <option key={form.id} value={form.id}>{form.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Formato de Salida</label>
                <select 
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium appearance-none"
                >
                  <option value="XLSX">Microsoft Excel (.xlsx)</option>
                  <option value="JSON">Raw Data (.json)</option>
                </select>
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
                  disabled={isExporting || !newName.trim() || !selectedFormId}
                  className="flex-1 flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-all"
                >
                  {isExporting ? (
                    <><Loader2 size={16} className="animate-spin" /> <span>Extrayendo...</span></>
                  ) : (
                    <span>Generar Reporte</span>
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

export default Exportaciones;
