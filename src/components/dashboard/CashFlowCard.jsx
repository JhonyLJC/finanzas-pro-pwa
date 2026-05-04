import React from 'react';
import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

export default function CashFlowCard({ pending = {}, month = {} }) {
  const { toPay = 0, toCollect = 0, balance = 0, paymentsCount = 0, receivablesCount = 0 } = pending;
  const { toPay: monthToPay = 0, paid = 0, toCollect: monthToCollect = 0, collected = 0 } = month;

  const isPositive = balance > 0;
  const isZero = balance === 0;
  const isNegative = balance < 0;

  const payPercent = monthToPay > 0 ? Math.min(100, (paid / monthToPay) * 100) : 0;
  const collectPercent = monthToCollect > 0 ? Math.min(100, (collected / monthToCollect) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-white/5 transition-all w-full flex flex-col gap-5">
      {/* Indicadores Principales */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 divide-x divide-slate-100 dark:divide-slate-800">

        {/* Por Pagar */}
        <div className="flex flex-col px-2 md:px-4 items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-1.5 text-red-500 mb-1">
            <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded-md hidden sm:block">
              <ArrowDownRight size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Por Pagar</span>
          </div>
          <span className="text-sm md:text-xl font-black text-slate-800 dark:text-slate-100 truncate w-full">
            S/ {Number(toPay).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">{paymentsCount} {paymentsCount === 1 ? 'pendiente' : 'pendientes'}</span>
        </div>

        {/* Por Cobrar */}
        <div className="flex flex-col px-2 md:px-4 items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded-md hidden sm:block">
              <ArrowUpRight size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Por Cobrar</span>
          </div>
          <span className="text-sm md:text-xl font-black text-slate-800 dark:text-slate-100 truncate w-full">
            S/ {Number(toCollect).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">{receivablesCount} {receivablesCount === 1 ? 'pendiente' : 'pendientes'}</span>
        </div>

        {/* Flujo Proyectado */}
        <div className="flex flex-col px-2 md:px-4 items-center md:items-start text-center md:text-left">
          <div className={`flex items-center gap-1.5 mb-1 ${isPositive ? 'text-blue-500' : isNegative ? 'text-red-500' : 'text-slate-500'}`}>
            <div className={`p-1 rounded-md hidden sm:block ${isPositive ? 'bg-blue-100 dark:bg-blue-900/30' : isNegative ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Scale size={14} />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Flujo Proyectado</span>
          </div>
          <span className={`text-sm md:text-xl font-black transition-colors truncate w-full ${isPositive ? 'text-blue-600 dark:text-blue-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
            S/ {Number(balance).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 dark:text-slate-500">Balance neto</span>
        </div>
      </div>

      {/* Barras de Progreso del Mes */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Progreso Pagos */}
        <div>
          <div className="flex justify-between text-[10px] md:text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Progreso de Pagos (Mes)</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">S/ {Number(paid).toLocaleString()} de S/ {Number(monthToPay).toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{ width: `${payPercent}%` }}></div>
          </div>
        </div>

        {/* Progreso Cobros */}
        <div>
          <div className="flex justify-between text-[10px] md:text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Progreso de Cobros (Mes)</span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">S/ {Number(collected).toLocaleString()} de S/ {Number(monthToCollect).toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${collectPercent}%` }}></div>
          </div>
        </div>
      </div>

    </div>
  );
}
