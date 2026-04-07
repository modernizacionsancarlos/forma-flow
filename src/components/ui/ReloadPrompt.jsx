import React, { useCallback } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import toast from 'react-hot-toast'

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady] = [false, () => {}],
    needUpdate: [needUpdate, setNeedUpdate] = [false, () => {}],
    updateServiceWorker = () => {},
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = useCallback(() => {
    setOfflineReady(false)
    setNeedUpdate(false)
  }, [setOfflineReady, setNeedUpdate])

  React.useEffect(() => {
    if (offlineReady) {
      toast.success('App lista para trabajar sin conexión', {
        duration: 5000,
        icon: '🚀'
      })
    }
  }, [offlineReady])

  React.useEffect(() => {
    if (needUpdate) {
      toast(() => (
        <div className="flex flex-col items-start space-y-3">
          <p className="text-sm font-bold">¡Nueva versión disponible!</p>
          <div className="flex space-x-2">
            <button
              onClick={() => updateServiceWorker(true)}
              className="bg-emerald-500 text-[#0b1726] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight"
            >
              Actualizar
            </button>
            <button
              onClick={() => close()}
              className="bg-slate-700 text-white px-3 py-1 rounded-lg text-xs font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      ), {
        duration: Infinity,
        id: 'pwa-update'
      })
    }
  }, [needUpdate, updateServiceWorker, close]);

  return null
}

export default ReloadPrompt
