import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullScreen = false, text = "Cargando..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      {text && <p className="text-sm text-gray-400 font-medium animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#06111C]">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
