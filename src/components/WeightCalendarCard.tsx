import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeightRecord {
  date: string;
  weight: number;
}

export default function WeightCalendarCard() {
  const [history, setHistory] = useState<WeightRecord[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('fitness_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.history) {
            setHistory(parsed.history);
          }
        } catch (e) {
          console.error("Error loading history", e);
        }
      }
    };

    loadData();
    window.addEventListener('fitness_updated', loadData);
    return () => window.removeEventListener('fitness_updated', loadData);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Helper to find record for a specific day
  const getRecordForDay = (day: number) => {
    const dateStr = `${day < 10 ? '0' + day : day}/${month + 1 < 10 ? '0' + (month + 1) : month + 1}/${year}`;
    return history.find(r => r.date === dateStr);
  };

  const days = [];
  // Padding for first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square w-full" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const record = getRecordForDay(day);
    const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

    days.push(
      <div 
        key={day} 
        className={`aspect-square w-full flex flex-col items-center justify-center rounded-2xl relative transition-all group ${
          record 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
            : isToday 
              ? 'border-2 border-blue-500 text-blue-600 font-black' 
              : 'bg-slate-50/50 hover:bg-slate-100 text-slate-400'
        }`}
      >
        <span className="text-xs font-black">{day}</span>
        {record && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10 whitespace-nowrap shadow-xl">
            {record.weight}kg
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <CalendarIcon size={14} className="text-blue-500" />
          Calendário de Saúde
        </h3>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
          <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all">
            <ChevronLeft size={16} />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-400 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{monthNames[month]}</h2>
          <p className="text-slate-400 font-bold">{year}</p>
        </div>
        <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
          {history.length} Registros
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-3">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <div key={`${d}-${i}`} className="aspect-square w-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 flex-1 items-start content-start">
        {days}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-black text-sm">
            {Math.round(history.length / daysInMonth * 100)}%
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-tight">Consistência</p>
            <p className="text-[10px] font-bold text-slate-500">Dias registrados este mês</p>
          </div>
        </div>
      </div>
    </div>
  );
}
