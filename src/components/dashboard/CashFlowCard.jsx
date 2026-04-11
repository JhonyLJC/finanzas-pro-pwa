import React from 'react';
import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

export default function CashFlowCard({ toPay = 0, toCollect = 0, balance = 0, paymentsCount = 0, receivablesCount = 0 }) {
  const isPositive = balance > 0;
  const isZero = balance === 0;
  const isNegative = balance < 0;
  
  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-white/5 transition-all w-full">
      <div className="grid grid-cols-3 gap-2 md:gap-4 divide-x divide-slate-100 dark:divide-slate-800">
        
        {/* Por Pagar (Salida) */}
        <div className="flex flex-col px-2 md:px-4 items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-1.5 text-red-500 mb-1">
            <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded-md hidden sm:block">
              <ArrowDownRight size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Por Pagar del Mes</span>
          </div>
          <span className="text-sm md:text-xl font-black text-slate-800 dark:text-slate-100 truncate w-full">
            S/ {Number(toPay).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">{paymentsCount} {paymentsCount === 1 ? 'pendiente' : 'pendientes'}</span>
        </div>

        {/* Por Cobrar (Entrada) */}
        <div className="flex flex-col px-2 md:px-4 items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-md hidden sm:block">
              <ArrowUpRight size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Por Cobrar del Mes</span>
          </div>
          <span className="text-sm md:text-xl font-black text-slate-800 dark:text-slate-100 truncate w-full">
             S/ {Number(toCollect).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">{receivablesCount} {receivablesCount === 1 ? 'pendiente' : 'pendientes'}</span>
        </div>

        {/* Balance Neto */}
        <div className="flex flex-col px-2 md:px-4 items-center md:items-start text-center md:text-left">
           <div className={`flex items-center gap-1.5 mb-1 ${isPositive ? 'text-blue-500' : isNegative ? 'text-red-500' : 'text-slate-500'}`}>
            <div className={`p-1 rounded-md hidden sm:block ${isPositive ? 'bg-blue-100 dark:bg-blue-900/30' : isNegative ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Scale size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Balance del Mes</span>
          </div>
          <span className={`text-sm md:text-xl font-black transition-colors truncate w-full ${isPositive ? 'text-blue-600 dark:text-blue-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
             S/ {Number(balance).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">Neto pendiente</span>
        </div>

      </div>
    </div>
  );
}
