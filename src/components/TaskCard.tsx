import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  type: 'daily' | 'study' | 'exercise';
  owner: 'giovane' | 'eusebio';
}

export default function TaskCard() {
  const [activeOwner, setActiveOwner] = useState<'giovane' | 'eusebio'>('giovane');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('life_tasks_v2');
    return saved ? JSON.parse(saved) : [
      { id: 'e1', text: 'Faça o 3d funcionar', completed: false, type: 'study', owner: 'eusebio' }
    ];
  });
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState<'all' | 'daily' | 'study' | 'exercise'>('all');

  useEffect(() => {
    localStorage.setItem('life_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTask,
      completed: false,
      type: filter === 'all' ? 'daily' : filter,
      owner: activeOwner
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => 
    t.owner === activeOwner && 
    (filter === 'all' || t.type === filter)
  );

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-[32px] p-8 h-full flex flex-col gap-6 shadow-xl overflow-hidden">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <ListTodo size={14} className="text-blue-500" />
            Tarefas
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveOwner('giovane')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeOwner === 'giovane' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Giovane
            </button>
            <button 
              onClick={() => setActiveOwner('eusebio')}
              className={`px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${activeOwner === 'eusebio' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Eusébio
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {['all', 'daily', 'study', 'exercise'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`text-[8px] uppercase font-black px-2 py-0.5 rounded-md transition-all shrink-0 ${filter === f ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              {f === 'all' ? 'Tudo' : f === 'daily' ? 'Geral' : f === 'study' ? 'Estudos' : 'Físico'}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={addTask} className="relative">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Nova tarefa..."
          className="w-full bg-slate-100/50 border-none rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-1.5 rounded-lg hover:scale-110 active:scale-95 transition-transform">
          <Plus size={18} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {(filteredTasks && filteredTasks.length > 0) ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={`flex items-center gap-3 p-3 rounded-2xl group transition-all ${task.completed ? 'bg-slate-50' : 'bg-white shadow-sm hover:shadow-md'}`}
              >
                <button onClick={() => toggleTask(task.id)} className="text-blue-500 shrink-0">
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-slate-300" />}
                </button>
                <span className={`text-sm flex-1 truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {task.text}
                </span>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-20 select-none">
              <ListTodo size={48} />
              <p className="text-xs font-bold uppercase mt-2">Nenhuma tarefa</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
