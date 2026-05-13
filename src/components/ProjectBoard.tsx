import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Youtube, Instagram, Twitter, MoreVertical, Trash2, Globe, Clock, Lightbulb } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'planning' | 'production' | 'completed';
  platform: 'youtube' | 'tiktok' | 'instagram' | 'other';
  createdBy: string;
  creatorName: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function ProjectBoard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', platform: 'youtube' as const });

  useEffect(() => {
    const path = 'projects';
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        status: 'idea',
        createdBy: auth.currentUser.uid,
        creatorName: auth.currentUser.displayName || 'Membro',
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewProject({ title: '', description: '', platform: 'youtube' });
    } catch (err) {
      console.error("Error adding project:", err);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const updateStatus = async (id: string, status: Project['status']) => {
    try {
      await updateDoc(doc(db, 'projects', id), { status });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="text-red-600" size={16} />;
      case 'instagram': return <Instagram className="text-pink-600" size={16} />;
      case 'tiktok': return <Globe className="text-slate-900" size={16} />;
      default: return <Globe className="text-blue-600" size={16} />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Pipelines</h3>
          <p className="text-xl font-black text-slate-900">Projetos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleAddProject}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4"
            >
              <input 
                autoFocus
                placeholder="Nome..."
                className="w-full bg-transparent border-none text-sm font-bold placeholder:text-slate-400 focus:ring-0 p-0"
                value={newProject.title}
                onChange={e => setNewProject({...newProject, title: e.target.value})}
                required
              />
              <textarea 
                placeholder="Descrição..."
                className="w-full bg-transparent border-none text-xs text-slate-500 focus:ring-0 p-0 resize-none h-16"
                value={newProject.description}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <select 
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-400 focus:ring-0 p-0 cursor-pointer"
                  value={newProject.platform}
                  onChange={e => setNewProject({...newProject, platform: e.target.value as any})}
                >
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Outro</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="text-[10px] font-bold text-slate-400 px-3 py-1">Cancelar</button>
                  <button type="submit" className="bg-slate-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg">Salvar Idea</button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {projects.map((project) => (
          <motion.div 
            layout
            key={project.id}
            className="group relative bg-white border border-slate-100 p-5 rounded-2xl hover:border-slate-300 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 rounded-lg">
                  {getPlatformIcon(project.platform)}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{project.platform}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                   project.status === 'idea' ? 'bg-amber-100 text-amber-600' :
                   project.status === 'planning' ? 'bg-blue-100 text-blue-600' :
                   project.status === 'production' ? 'bg-purple-100 text-purple-600' :
                   'bg-emerald-100 text-emerald-600'
                 }`}>
                   {project.status}
                 </span>
                 <button onClick={() => deleteProject(project.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                   <Trash2 size={14} />
                 </button>
              </div>
            </div>
            
            <h4 className="font-bold text-slate-900 mb-1">{project.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{project.description || "Sem descrição definida ainda."}</p>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {project.creatorName?.[0]}
                </div>
                <span className="text-[10px] font-medium text-slate-400">por {project.creatorName}</span>
              </div>
              <div className="flex gap-1">
                {project.status !== 'completed' && (
                  <button 
                    onClick={() => updateStatus(project.id, project.status === 'idea' ? 'planning' : project.status === 'planning' ? 'production' : 'completed')}
                    className="text-[9px] font-black text-slate-900 uppercase tracking-widest hover:underline"
                  >
                    Evoluir →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
