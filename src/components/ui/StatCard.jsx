import React from 'react';

export default function StatCard({ title, data, symbol, icon, color }) {
  const colorClasses = {
    amber: "from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500",
    blue: "from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-cyan-500"
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 flex flex-col justify-between transition-colors backdrop-blur-sm relative overflow-hidden">
        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl pointer-events-none`}></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-1 drop-shadow-sm">
                    <span className="text-lg font-bold text-slate-400 dark:text-slate-500 mr-1">{symbol}</span>
                    {data.pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Monto Pendiente Estimado</p>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-500/10 border border-transparent dark:border-${color}-500/20 shadow-inner`}>
                {icon}
            </div>
        </div>

        <div className="space-y-2 relative z-10">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400 dark:text-slate-400">Progreso Mensual</span>
                <span className={`text-${color}-600 dark:text-${color}-400 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]`}>{Math.round(data.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 dark:shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{
                    width: `${data.progress}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span>Pagado: {symbol}{data.paid.toLocaleString()}</span>
                <span>Total: {symbol}{data.total.toLocaleString()}</span>
            </div>
        </div>
    </div>
  );
}
