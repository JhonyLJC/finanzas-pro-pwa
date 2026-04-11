import React from 'react';
import { Crown, Check, ExternalLink } from 'lucide-react';

export default function SubscriptionView({ user }) {
  const plans = [
    { name: 'Personal', price: '9.90', features: ['Registro manual de deudas', 'Visualización del calendario'] },
    { name: 'Negocio', price: '19.90', features: ['Hasta 5 usuarios', 'Roles de Admin/Empleado', 'Reportes en Excel'] },
    { name: 'Empresa', price: '49.90', features: ['Usuarios ilimitados', 'Rol de Contador', 'Notificaciones Automáticas'] }
  ];

  const handleWhatsApp = (planName, price) => {
    const phone = '51964173218';
    const msg = `Hola equipo FINANZASPRO, deseo activar mi cuenta.\nUsuario: ${user?.email}\nPlan: ${planName} (S/ ${price})`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-6">
         <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl mb-4">
             <Crown size={32} />
         </div>
         <h2 className="text-3xl font-black text-slate-800 dark:text-white capitalize">Activa tu Suscripción</h2>
         <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">Selecciona el plan que se adapte mejor a tus necesidades y contáctanos para activar tu cuenta de inmediato.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {plans.map((plan, i) => (
           <div key={plan.name} className={`bg-white dark:bg-slate-900/60 rounded-3xl p-6 border transition-all ${i === 1 ? 'border-blue-500 shadow-xl dark:shadow-[0_10px_30px_rgba(59,130,246,0.3)] shadow-blue-500/20 scale-105' : 'border-slate-200 dark:border-white/10 hover:border-blue-300 shadow-sm'}`}>
              <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest">{plan.name}</h3>
              <div className="mt-4 mb-6">
                 <span className="text-4xl font-black text-slate-800 dark:text-slate-100">S/ {plan.price}</span>
                 <span className="text-slate-500 dark:text-slate-400"> /mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                     <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-full text-emerald-600"><Check size={12} /></div>
                     {f}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleWhatsApp(plan.name, plan.price)}
                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                  ${i === 1 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                 Contactar por WhatsApp <ExternalLink size={16} />
              </button>
           </div>
         ))}
      </div>
    </div>
  );
}
