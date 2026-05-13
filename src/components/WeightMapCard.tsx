import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Map as MapIcon, Calendar, ArrowRight, ChevronRight, Target } from 'lucide-react';
import { motion } from 'motion/react';

interface WeightRecord {
  date: string;
  weight: number;
}

export default function WeightMapCard() {
  const [history, setHistory] = useState<WeightRecord[]>([]);
  const [daysRemaining, setDaysRemaining] = useState(60);
  const targetWeight = 87; // Fase 1: 87kg
  const finalTargetWeight = 75; // Fase 2: -12kg (87-12=75)

  useEffect(() => {
    // Handle target date logic
    let targetDateStr = localStorage.getItem('weight_target_date');
    let targetDate: Date;

    if (!targetDateStr) {
      const date = new Date();
      date.setDate(date.getDate() + 60);
      targetDate = date;
      localStorage.setItem('weight_target_date', date.toISOString());
    } else {
      targetDate = new Date(targetDateStr);
    }

    const calculateDays = () => {
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));
    };

    calculateDays();
    const interval = setInterval(calculateDays, 3600000);

    const loadData = () => {
      const saved = localStorage.getItem('fitness_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.history) {
            // Recharts prefers data in chronological order (oldest first)
            const sorted = [...parsed.history].reverse();
            setHistory(sorted);
          }
        } catch (e) {
          console.error("Error loading history", e);
        }
      }
    };

    loadData();
    window.addEventListener('fitness_updated', loadData);
    return () => {
      window.removeEventListener('fitness_updated', loadData);
      clearInterval(interval);
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
          <p className="text-sm font-bold text-blue-400">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-500" />
          Mapa de Evolução
        </h3>
        <div className="group relative">
          <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-100 uppercase flex items-center gap-1 tracking-widest">
            <Target size={10} />
            Meta: {targetWeight} kg
          </div>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Calendar size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-500 uppercase leading-tight">Contagem Regressiva</p>
            <p className="text-sm font-bold text-slate-700 italic uppercase">Fase 1: Meta 87 kg ({daysRemaining} dias)</p>
            <p className="text-[10px] font-medium text-slate-400">Próxima: -12kg (Meta Final 75kg)</p>
          </div>
        </div>
        {history.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-tight">Restante</p>
            <p className="text-sm font-black text-indigo-600">
              {(history[history.length - 1].weight - targetWeight).toFixed(1)} kg
            </p>
          </div>
        )}
      </div>

      {/* Progress bar countdown */}
      <div className="mb-4">
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, (60 - daysRemaining) / 60 * 100))}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-indigo-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] font-black text-slate-300 uppercase">Início (60d)</span>
          <span className="text-[8px] font-black text-indigo-400 uppercase">Meta Chegando</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[160px] relative">
        {history.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                hide 
              />
              <YAxis 
                hide 
                domain={['dataMin - 5', 'dataMax + 5']} 
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={targetWeight} stroke="#6366f1" strokeDasharray="3 3" label={{ position: 'right', value: 'Meta 1', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
              <ReferenceLine y={finalTargetWeight} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Final', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }} />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
               <TrendingUp size={24} className="opacity-20" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-center max-w-[150px]">
              Salve seu peso no card de Fitness para ver o mapa
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between group cursor-pointer">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Último Registro</p>
            <p className="text-lg font-black text-slate-700">
              {history.length > 0 ? `${history[history.length - 1].weight} kg` : '--'}
            </p>
          </div>
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 transition-transform group-hover:translate-x-1">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
