import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Scale, Ruler, History, Plus, Target, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeightRecord {
  date: string;
  weight: number;
}

interface FitnessData {
  weight: number;
  height: number;
  bodyFat: number;
  history: WeightRecord[];
}

export default function FitnessCard() {
  const [data, setData] = useState<FitnessData>(() => {
    const saved = localStorage.getItem('fitness_data');
    const base = { weight: 75, height: 175, bodyFat: 15, history: [] };
    if (!saved) return base;
    try {
      const parsed = JSON.parse(saved);
      return { ...base, ...parsed }; // Merge to ensure all fields exist
    } catch {
      return base;
    }
  });

  useEffect(() => {
    localStorage.setItem('fitness_data', JSON.stringify(data));
    // Trigger a custom event so other components can sync
    window.dispatchEvent(new Event('fitness_updated'));
  }, [data]);

  const saveWeightRecord = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const newRecord: WeightRecord = { date: today, weight: data.weight };
    
    // Check if we already have a record for today to update it, else add new
    const existingIndex = data.history.findIndex(r => r.date === today);
    let newHistory = [...data.history];
    if (existingIndex >= 0) {
      newHistory[existingIndex] = newRecord;
    } else {
      newHistory = [newRecord, ...newHistory]; // Store all records for the "map"
    }
    
    setData({ ...data, history: newHistory });
  };

  const bmi = (data.weight / Math.pow(data.height / 100, 2)).toFixed(1);
  
  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-500' };
    if (val < 25) return { label: 'Normal', color: 'text-green-500' };
    if (val < 30) return { label: 'Sobrepeso', color: 'text-yellow-500' };
    return { label: 'Obesidade', color: 'text-red-500' };
  };

  const category = getBMICategory(parseFloat(bmi));

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 h-full flex flex-col gap-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <Activity size={14} className="text-blue-500" />
          Fitness & Saúde
        </h3>
        <TrendingUp size={16} className="text-slate-300" />
      </div>

      <div className="grid grid-cols-2 gap-8 mt-4">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Scale size={10} /> Peso (kg)
          </span>
          <div className="flex flex-col gap-2">
            <input 
              type="number" 
              value={data.weight} 
              onChange={(e) => setData({ ...data, weight: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-100/50 border-none rounded-xl p-2 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={saveWeightRecord}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-200 active:scale-95"
            >
              <Plus size={14} />
              Salvar Peso
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Ruler size={10} /> Altura (cm)
          </span>
          <input 
            type="number" 
            value={data.height} 
            onChange={(e) => setData({ ...data, height: parseFloat(e.target.value) || 0 })}
            className="bg-slate-100/50 border-none rounded-xl p-2 text-lg font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
          % Gordura Corporal
        </span>
        <div className="flex items-center gap-3">
          <input 
            type="range" 
            min="3" 
            max="50" 
            step="0.5"
            value={data.bodyFat} 
            onChange={(e) => setData({ ...data, bodyFat: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-lg font-mono min-w-[3rem] text-right">{data.bodyFat}%</span>
        </div>
      </label>

      {/* Target Body Goals */}
      <div className="grid grid-cols-1 gap-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-indigo-400 flex items-center gap-1 mb-1">
              <Target size={10} /> Meta Fase 1
            </p>
            <p className="text-xl font-black text-slate-800 tracking-tight">87 <span className="text-[10px] text-slate-400 font-bold">kg</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1 mb-1 justify-end">
              Meta Final <ArrowRight size={10} />
            </p>
            <p className="text-xl font-black text-slate-800 tracking-tight">75 <span className="text-[10px] text-slate-400 font-bold">kg</span></p>
          </div>
        </div>
      </div>

      {/* Weight History Section */}
      <div className="flex-1 bg-slate-50/50 rounded-2xl p-3 border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <History size={12} className="text-slate-400" />
          <span className="text-[10px] uppercase font-bold text-slate-400">Histórico Recente</span>
        </div>
        <div className="space-y-1 overflow-y-auto max-h-24 custom-scrollbar">
          {(data.history && data.history.length > 0) ? (
            data.history.map((record, i) => (
              <div key={i} className="flex justify-between items-center text-xs p-1 h-8">
                <span className="text-slate-500 font-medium">{record.date}</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-100">{record.weight}kg</span>
              </div>
            ))
          ) : (
            <p className="text-[10px] text-slate-400 italic text-center py-4">Nenhum registro ainda</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">IMC Atual</p>
            <p className="text-2xl font-bold font-mono tracking-tighter">{bmi}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
            <p className={`font-semibold ${category.color}`}>{category.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
