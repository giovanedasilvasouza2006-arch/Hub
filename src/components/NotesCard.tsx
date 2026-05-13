import React, { useState, useEffect } from 'react';
import { Lightbulb, BookOpen, ScrollText } from 'lucide-react';
import { motion } from 'motion/react';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'study' | 'idea';
}

export default function NotesCard() {
  const [activeTab, setActiveTab] = useState<'study' | 'idea'>('study');
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('life_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Aprender Rust', content: 'Começar com o livro The Rust Book', category: 'study' },
      { id: '2', title: 'App de Plantas', content: 'Usar realidade aumentada para identificar pragas', category: 'idea' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('life_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nova Nota',
      content: '',
      category: activeTab
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, field: keyof Note, value: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const currentNotes = notes.filter(n => n.category === activeTab);

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-[32px] p-8 h-full flex flex-col gap-6 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all ${activeTab === 'study' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <BookOpen size={16} /> Estudos
          </button>
          <button 
            onClick={() => setActiveTab('idea')}
            className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider transition-all ${activeTab === 'idea' ? 'text-red-600' : 'text-slate-400'}`}
          >
            <Lightbulb size={16} /> Ideias
          </button>
        </div>
        <button 
          onClick={addNote}
          className={`p-1.5 rounded-lg text-white ${activeTab === 'study' ? 'bg-blue-500' : 'bg-red-500'} hover:scale-110 active:scale-95 transition-transform`}
        >
          <ScrollText size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
        {currentNotes.length > 0 ? (
          currentNotes.map((note) => (
            <motion.div 
              key={note.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl border-l-4 ${activeTab === 'study' ? 'border-blue-500 bg-blue-50/50' : 'border-red-500 bg-red-50/50'}`}
            >
              <input 
                value={note.title}
                onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                className="bg-transparent border-none font-bold text-slate-800 w-full mb-1 focus:ring-0 p-0 text-sm"
                placeholder="Título"
              />
              <textarea 
                value={note.content}
                onChange={(e) => updateNote(note.id, 'content', e.target.value)}
                className="bg-transparent border-none text-slate-600 w-full text-xs focus:ring-0 p-0 resize-none h-16 leading-relaxed"
                placeholder="Conteúdo..."
              />
              <div className="flex justify-end mt-1">
                <button 
                  onClick={() => deleteNote(note.id)}
                  className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-20 select-none">
            {activeTab === 'study' ? <BookOpen size={48} /> : <Lightbulb size={48} />}
            <p className="text-xs font-bold uppercase mt-2">Vazio por agora</p>
          </div>
        )}
      </div>
    </div>
  );
}
