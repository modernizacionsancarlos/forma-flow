import React, { useState, useMemo } from "react";
import { useAuth } from "../lib/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn, ShieldAlert, FileText, CheckCircle2, Mail } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitationHint = useMemo(() => {
    const v = searchParams.get("invitacion");
    return v === "pendiente" || v === "1";
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Credenciales no válidas para el panel de administración.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b13] p-6 font-inter relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#10b981]/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#0a101b] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-3xl shadow-emerald-500/5">
          <div className="text-center mb-10">
             <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 mb-6 group transition-all duration-500 hover:scale-110">
                 <img src="/pwa-192x192.png" alt="Logo" className="w-12 h-12 grayscale-[0.5] group-hover:grayscale-0 transition-all" />
             </div>
             
             <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">FormFlow</h1>
             <div className="inline-flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-1 bg-white/5 rounded-full mx-auto">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Portal de Gestión Municipal</span>
             </div>
          </div>

          {invitationHint && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 p-4 rounded-2xl mb-6 text-[11px] font-semibold flex items-start gap-3">
              <Mail size={18} className="shrink-0 text-emerald-400 mt-0.5" />
              <span>
                Tenés una <strong className="text-white">invitación pendiente</strong>. Ingresá con el{" "}
                <strong className="text-white">mismo correo</strong> al que te enviaron la invitación; al entrar al panel
                podrás pulsar <strong className="text-white">Aceptar</strong> en el aviso inferior.
              </span>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-8 text-[11px] font-bold flex items-center space-x-3 animate-in slide-in-from-top-2 duration-300">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Credencial de Acceso</label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 focus:border-emerald-500/50 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none transition-all placeholder:text-slate-700 font-medium"
                  placeholder="admin@municipio.gob"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contraseña Segura</label>
               <input
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-slate-950/50 border border-white/5 focus:border-emerald-500/50 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none transition-all placeholder:text-slate-700 font-medium"
                 placeholder="••••••••"
                 required
               />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-emerald-900/10 active:scale-[0.98]"
            >
              <LogIn size={18} />
              <span>{isLoading ? "Validando..." : "Ingresar al Panel"}</span>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center space-y-4">
             <div className="flex items-center space-x-4 opacity-30 grayscale hover:grayscale-0 transition-all hover:opacity-100">
                <div className="flex items-center space-x-1">
                   <FileText size={12} className="text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-400">Trámites</span>
                </div>
                <div className="flex items-center space-x-1">
                   <CheckCircle2 size={12} className="text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-400">Auditoría</span>
                </div>
             </div>
             <p className="text-slate-600 font-bold text-[8px] uppercase tracking-widest text-center">
               Desarrollado para la Dirección de Modernización <br />
               <span className="text-slate-800">Municipalidad de San Carlos</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
