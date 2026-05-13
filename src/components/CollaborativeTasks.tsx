import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Clock, User, ArrowRight, Plus, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  assignedBy: string;
  assignedByName: string;
  assignedTo: string;
  assignedToName: string;
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

export default function CollaborativeTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', assignedToName: '' });

  useEffect(() => {
    const path = 'tasks';
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(ts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTask.title,
        status: 'todo',
        assignedBy: auth.currentUser.uid,
        assignedByName: auth.currentUser.displayName || 'Membro',
        assignedTo: '', // For now we just use a name, but we could use UID
        assignedToName: newTask.assignedToName || 'Equipe',
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewTask({ title: '', assignedToName: '' });
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'todo' ? 'doing' : current === 'doing' ? 'done' : 'todo';
    try {
      await updateDoc(doc(db, 'tasks', id), { status: next });
    } catch (err) {
       console.error("Error toggling task:", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const deleteAllTasks = async () => {
    if (!confirm('Deseja realmente apagar TODAS as tarefas? Esta ação não pode ser desfeita.')) return;
    try {
      const deletePromises = tasks.map(t => deleteDoc(doc(db, 'tasks', t.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error("Error clearing tasks:", err);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Workflow</h3>
          <div className="flex items-center gap-3">
            <p className="text-xl font-black text-slate-900">Tarefas</p>
            {tasks.length > 0 && (
              <button 
                onClick={deleteAllTasks}
                className="text-[9px] font-bold text-red-400 hover:text-red-500 bg-red-50 px-2 py-0.5 rounded-md transition-colors"
                title="Apagar tudo"
              >
                LIMPAR
              </button>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {isAdding && (
          <form onSubmit={handleAddTask} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 mb-4 space-y-3">
            <input 
              autoFocus
              placeholder="Nova tarefa..."
              className="w-full bg-transparent border-none text-sm font-bold placeholder:text-blue-300 focus:ring-0 p-0"
              value={newTask.title}
              onChange={e => setNewTask({...newTask, title: e.target.value})}
              required
            />
            <div className="flex items-center gap-3 pt-2 border-t border-blue-100">
               <input 
                placeholder="Responsável..."
                className="bg-transparent border-none text-[10px] font-bold text-blue-600 focus:ring-0 p-0 w-full"
                value={newTask.assignedToName}
                onChange={e => setNewTask({...newTask, assignedToName: e.target.value})}
               />
               <button type="submit" className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-lg shrink-0">CRIAR</button>
            </div>
          </form>
        )}

        {tasks.map((task) => (
          <div 
            key={task.id}
            className="group bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all"
          >
            <div className="flex items-start gap-4">
              <button 
                onClick={() => toggleStatus(task.id, task.status)}
                className={`mt-1 transition-all ${
                  task.status === 'done' ? 'text-emerald-500' : 
                  task.status === 'doing' ? 'text-blue-500' : 'text-slate-300'
                }`}
              >
                {task.status === 'done' ? <CheckCircle2 size={22} /> : 
                 task.status === 'doing' ? <Clock size={22} /> : <Circle size={22} />}
              </button>
              
              <div className="flex-1">
                <p className={`text-sm font-bold text-slate-800 tracking-tight leading-snug ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </p>
              </div>

              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
               <div className="flex items-center gap-1.5 opacity-60">
                 <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">{task.assignedByName?.[0]}</div>
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{task.assignedByName}</span>
               </div>
               <ArrowRight size={10} className="text-slate-200" />
               <div className="flex items-center gap-1.5">
                 <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">{task.assignedToName?.[0]}</div>
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{task.assignedToName}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
