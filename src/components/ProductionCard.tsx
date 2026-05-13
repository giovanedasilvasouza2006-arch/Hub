import React, { useState, useEffect } from 'react';
import { Package, Cog, Power, Zap, MessageSquare, X, Save, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Project {
  id: string;
  name: string;
  status: 'production' | 'off';
  notes?: string;
}

export default function ProductionCard() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('life_projects');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Website Gestão', status: 'production', notes: 'Desenvolvendo dashboard com Three.js e Tailwind' },
      { id: '2', name: 'Treino Hipertrofia e perca de peso - meta 85kg', status: 'production', notes: 'Focar em braços hoje.\nSéries: 4x12 Rosca Direta' },
      { id: '5', name: 'App Bíblia', status: 'production', notes: 'Leitura diária e devocional' },
      { id: '3', name: 'Emagrecimento', status: 'off', notes: '' }
    ];
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    localStorage.setItem('life_projects', JSON.stringify(projects));
  }, [projects]);

  const toggleStatus = (id: string) => {
    setProjects(projects.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'production' ? 'off' : 'production' } 
        : p
    ));
  };

  const addProject = () => {
    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Projeto',
      status: 'off',
      notes: ''
    };
    setProjects([...projects, newProj]);
    setEditingProject(newProj);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setEditingProject(null);
  };

  const updateProject = () => {
    if (!editingProject) return;
    setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p));
    setEditingProject(null);
  };

  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl p-6 h-full flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <Package size={14} className="text-red-500" />
          Atividade
        </h3>
        <button 
          onClick={addProject}
          className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-110 active:scale-95 transition-transform"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 mt-2 overflow-y-auto pr-1 custom-scrollbar">
        {(projects && projects.length > 0) ? projects.map((project) => (
          <div 
            key={project.id}
            className="flex flex-col p-3 rounded-2xl bg-white/60 shadow-sm border border-slate-100 hover:border-red-200 transition-all gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${project.status === 'production' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                  {project.status === 'production' ? <Zap size={16} /> : <Power size={16} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 leading-tight">{project.name}</p>
                  <p className={`text-[9px] uppercase font-black ${project.status === 'production' ? 'text-red-500' : 'text-slate-400'}`}>
                    {project.status === 'production' ? 'Ativo' : 'Off'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setEditingProject(project)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  title="Editar Projeto"
                >
                  <MessageSquare size={16} />
                </button>
                <button 
                  onClick={() => toggleStatus(project.id)}
                  className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${project.status === 'production' ? 'bg-red-500' : 'bg-slate-300'}`}
                >
                  <motion.div 
                    animate={{ x: project.status === 'production' ? 22 : 2 }}
                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>

            {project.notes && (
              <p className="text-[11px] text-slate-400 italic px-2 truncate">
                {project.notes}
              </p>
            )}
          </div>
        )) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-20 select-none">
            <Package size={48} />
            <p className="text-xs font-bold uppercase mt-2">Sem projetos</p>
          </div>
        )}
      </div>

      {/* Modern Modal Overlay */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gerenciar Projeto</p>
                  </div>
                  <input 
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                    className="text-2xl font-black text-slate-800 tracking-tight bg-slate-50 rounded-xl px-3 py-1 w-full border-none focus:ring-2 focus:ring-red-500"
                    placeholder="Nome do projeto"
                  />
                </div>
                <button 
                  onClick={() => setEditingProject(null)}
                  className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <textarea 
                value={editingProject.notes || ''}
                onChange={(e) => setEditingProject({ ...editingProject, notes: e.target.value })}
                className="w-full h-48 bg-slate-50 rounded-2xl p-6 text-slate-600 focus:ring-2 focus:ring-red-500 outline-none border-none resize-none leading-relaxed text-sm font-medium"
                placeholder="Anotações e detalhes..."
              />

              <div className="mt-6 flex justify-between items-center">
                <button 
                  onClick={() => deleteProject(editingProject.id)}
                  className="text-xs font-bold text-red-500 hover:text-red-600 px-4 py-2"
                >
                  Excluir Projeto
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setEditingProject(null)}
                    className="px-6 py-3 rounded-2xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={updateProject}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-100 transition-all hover:scale-105 active:scale-95"
                  >
                    <Save size={18} />
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
