import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      const enterTimer = setTimeout(() => setVisible(true), 10);
      const exitTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for transition fade-out
      }, 3000);
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(exitTimer);
      };
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-20 md:top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border ${
          type === 'error' 
          ? 'bg-red-500/90 border-red-400 text-white shadow-red-500/30' 
          : 'bg-green-600/90 border-green-500 text-white shadow-green-600/30'
      }`}>
        {type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
        <p className="font-bold text-sm tracking-wide">{message}</p>
      </div>
    </div>
  );
}
