import React from 'react';
import { useInvitations } from '../../api/useInvitations';
import { useAuth } from '../../lib/AuthContext';
import { CheckCircle, XCircle, Building, ShieldCheck } from 'lucide-react';

const JoinOrganization = () => {
  const { currentProfile } = useAuth();
  const { myInvitation, acceptInvitation } = useInvitations();

  // Si ya tiene tenant o no tiene invitación, no mostrar nada
  if (currentProfile?.tenantId || !myInvitation) return null;

  const handleAccept = () => {
    acceptInvitation.mutate({
      invitationId: myInvitation.id,
      tenantId: myInvitation.tenantId,
      role: myInvitation.role
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-2xl p-6 overflow-hidden relative group">
        {/* Decorative Background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
        
        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                ¡Invitación Recibida!
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Has sido invitado a unirte a una organización en FormaFlow.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rol Asignado</span>
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5 capitalize">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  {myInvitation.role?.replace('_', ' ')}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200"></div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Tenant</span>
                <span className="text-sm font-mono text-slate-600 truncate max-w-[120px]">
                  {myInvitation.tenantId}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              onClick={handleAccept}
              disabled={acceptInvitation.isLoading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {acceptInvitation.isLoading ? 'Uniéndose...' : 'Aceptar'}
            </button>
            <button
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-3 px-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
            >
              <XCircle className="w-4 h-4" />
              Ignorar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinOrganization;
