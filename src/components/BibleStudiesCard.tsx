import React, { useState, useEffect } from 'react';
import { Book, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BibleStudy {
  id: string;
  topic: string;
  completed: boolean;
}

export function BibleStudiesCard() {
  const [studies, setStudies] = useState<BibleStudy[]>(() => {
    const saved = localStorage.getItem('bible_studies');
    return saved ? JSON.parse(saved) : [
      { id: '1', topic: 'Epístola aos Romanos: Graça e Fé', completed: false },
      { id: '2', topic: 'O Sermão do Monte (Mateus 5-7)', completed: true },
      { id: '3', topic: 'Parábolas do Reino de Deus', completed: false }
    ];
  });

  const [newTopic, setNewTopic] = useState('');

  useEffect(() => {
    localStorage.setItem('bible_studies', JSON.stringify(studies));
  }, [studies]);

  const addStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    const study: BibleStudy = {
      id: Math.random().toString(36).substr(2, 9),
      topic: newTopic,
      completed: false
    };
    setStudies([study, ...studies]);
    setNewTopic('');
  };

  const toggleStudy = (id: string) => {
    setStudies(studies.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const deleteStudy = (id: string) => {
    setStudies(studies.filter(s => s.id !== id));
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-md rounded-[32px] p-6 h-full flex flex-col border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
          <Book size={16} />
          Estudos Bíblicos
        </h3>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
          {studies.filter(s => s.completed).length}/{studies.length}
        </span>
      </div>

      <form onSubmit={addStudy} className="relative mb-4">
        <input 
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Novo tema de estudo..."
          className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 pr-10 placeholder:text-slate-600 transition-all"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 p-1.5 transition-colors">
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        <AnimatePresence mode="popLayout">
          {studies.map((study) => (
            <motion.div 
              key={study.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all group ${
                study.completed 
                  ? 'bg-slate-900/30 border-transparent opacity-50' 
                  : 'bg-slate-900/60 border-white/5 hover:border-blue-500/30'
              }`}
            >
              <button onClick={() => toggleStudy(study.id)} className="shrink-0">
                {study.completed 
                  ? <CheckCircle2 size={20} className="text-blue-500" /> 
                  : <Circle size={20} className="text-slate-600" />
                }
              </button>
              
              <span className={`text-sm flex-1 font-medium transition-all ${
                study.completed ? 'line-through text-slate-600' : 'text-slate-300'
              }`}>
                {study.topic}
              </span>

              <button 
                onClick={() => deleteStudy(study.id)}
                className="opacity-40 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
