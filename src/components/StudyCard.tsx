import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Trash2, BookOpen, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudyTask {
  id: string;
  task: string;
  completed: boolean;
  owner: 'giovane' | 'eusebio';
}

export function StudyCard() {
  const [activeOwner, setActiveOwner] = useState<'giovane' | 'eusebio'>('giovane');
  const [studies, setStudies] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem('studio_studies_v1');
    return saved ? JSON.parse(saved) : [
      { id: 'g1', task: 'Review React Doc', completed: false, owner: 'giovane' },
      { id: 'e1', task: '3D Optimization', completed: false, owner: 'eusebio' }
    ];
  });

  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    localStorage.setItem('studio_studies_v1', JSON.stringify(studies));
  }, [studies]);

  const addStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const study: StudyTask = {
      id: Math.random().toString(36).substr(2, 9),
      task: newTask,
      completed: false,
      owner: activeOwner
    };
    setStudies([study, ...studies]);
    setNewTask('');
  };

  const toggleStudy = (id: string) => {
    setStudies(studies.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const deleteStudy = (id: string) => {
    setStudies(studies.filter(s => s.id !== id));
  };

  const filteredStudies = studies.filter(s => s.owner === activeOwner);

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-[32px] p-6 h-full flex flex-col border border-white/10 shadow-2xl transition-all">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
            <BookOpen size={14} />
            Cronograma de Estudos
          </h3>
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveOwner('giovane')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeOwner === 'giovane' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              Giovane
            </button>
            <button 
              onClick={() => setActiveOwner('eusebio')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeOwner === 'eusebio' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
            >
              Eusébio
            </button>
          </div>
        </div>

        <form onSubmit={addStudy} className="relative">
          <input 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={`O que ${activeOwner} vai estudar?`}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-4 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 pr-10 placeholder:text-slate-600 transition-all font-medium"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 p-1.5 transition-colors">
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredStudies.map((study) => (
            <motion.div 
              key={study.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all group ${
                study.completed 
                  ? 'bg-slate-900/30 border-transparent opacity-50' 
                  : 'bg-slate-900/60 border-white/5 hover:border-blue-500/30'
              }`}
            >
              <button onClick={() => toggleStudy(study.id)} className="shrink-0">
                {study.completed 
                  ? <CheckCircle2 size={18} className="text-blue-500" /> 
                  : <Circle size={18} className="text-slate-600 hover:text-blue-400 transition-colors" />
                }
              </button>
              
              <span className={`text-sm flex-1 font-medium truncate transition-all ${
                study.completed ? 'line-through text-slate-600' : 'text-slate-300'
              }`}>
                {study.task}
              </span>

              <button 
                onClick={() => deleteStudy(study.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
          {filteredStudies.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center opacity-20 select-none">
              <BookOpen size={40} />
              <p className="text-[10px] font-black uppercase mt-2">Sem aulas hoje</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
