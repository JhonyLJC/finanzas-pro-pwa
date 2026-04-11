import React from 'react';
import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function DayInsights({ insights = [] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => {
        const msg = insight.message || insight.text || insight;
        const type = insight.type || 'info'; 

        let colorClasses = '';
        let IconElement = Info;

        switch (type) {
          case 'danger':
          case 'alert':
            colorClasses = 'bg-red-50/80 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300';
            IconElement = AlertTriangle;
            break;
          case 'warning':
            colorClasses = 'bg-amber-50/80 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-300';
            IconElement = AlertTriangle;
            break;
          case 'success':
          case 'positive':
             colorClasses = 'bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-300';
             IconElement = CheckCircle2;
             break;
          case 'info':
          default:
            colorClasses = 'bg-blue-50/80 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-300';
            IconElement = Lightbulb;
            break;
        }

        return (
          <div key={idx} className={`flex items-start gap-3 p-3.5 rounded-xl border shadow-sm backdrop-blur-sm transition-colors ${colorClasses}`}>
             <div className="shrink-0 mt-0.5 opacity-80">
                <IconElement size={18} />
             </div>
             <p className="text-sm font-medium leading-snug flex-1">
                {msg}
             </p>
          </div>
        );
      })}
    </div>
  );
}
