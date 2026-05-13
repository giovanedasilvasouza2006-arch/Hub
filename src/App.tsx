import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'motion/react';
import { Calendar, User, Settings, Bell, LayoutDashboard, AlertCircle, Download, Upload } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import Scene3D from './components/Studio3D';
import ProjectBoard from './components/ProjectBoard';
import CollaborativeTasks from './components/CollaborativeTasks';
import TaskCard from './components/TaskCard';
import ProductionCard from './components/ProductionCard';
import { StudyCard } from './components/StudyCard';
import { MindMapCard } from './components/MindMapCard';
// import YouTubePlayer from './components/YouTubePlayer';

// Error Boundary-like component for Canvas to prevent white screen
class CanvasErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900 p-8 text-white text-center">
          <AlertCircle size={48} className="text-rose-500 mb-4" />
          <h3 className="font-bold">Erro no Motor 3D</h3>
          <p className="text-xs text-white/50 mt-2">Ocorreu um problema ao renderizar o núcleo. Tente recarregar a página.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white font-black animate-pulse uppercase tracking-[1em]">Carregando Studio...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-[48px] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-8 flex items-center justify-center text-white text-4xl font-black">S</div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Creator Sync</h1>
          <p className="text-slate-500 mb-10 font-medium italic">Produza mais, juntos. O seu QG de conteúdo em um único lugar.</p>
          <button 
            onClick={login}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-sm"
          >
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-red-100 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200">
              L
            </div>
            <span className="font-bold tracking-tight text-xl hidden sm:inline-block">Creator Sync</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1 text-slate-500 font-medium text-sm">
              <Calendar size={16} />
              <span className="capitalize">{currentDate}</span>
            </div>
            
            <div className="flex items-center gap-2 border-l border-slate-200 pl-6 text-slate-400">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Notificações">
                <Bell size={20} />
              </button>
              <button 
                onClick={logout}
                className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-colors" 
                title="Sair"
              >
                <Upload size={20} className="rotate-180" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden text-white font-black">
                {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : user.displayName?.[0]}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 md:px-10 pt-24 pb-20">
        <header className="mb-10 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-[9px] mb-1">
                Studio Sync
              </p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">
                Workspace
              </h1>
              <p className="text-slate-500 mt-1 font-medium text-sm">
                Olá, <span className="text-slate-900 font-bold">{user.displayName}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-3">
                <input 
                  type="file" 
                  id="import-backup" 
                  className="hidden" 
                  accept=".json,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const content = event.target?.result as string;
                        const data = JSON.parse(content);
                        
                        // Support both payload wrapped or direct object
                        const backupData = data.payload || data;
                        
                        Object.keys(backupData).forEach(key => {
                          const val = backupData[key];
                          localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
                        });
                        
                        alert('✓ Dados importados com sucesso! O sistema irá reiniciar.');
                        window.location.reload();
                      } catch (err) {
                        alert('X Erro ao importar: Certifique-se de usar um arquivo JSON de backup válido.');
                        console.error(err);
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
                <button 
                  onClick={() => document.getElementById('import-backup')?.click()}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
                  title="IMPORTAR"
                >
                  <Upload size={18} />
                </button>
                
                <button 
                  onClick={() => {
                    const payload: Record<string, any> = {};
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key) payload[key] = localStorage.getItem(key);
                    }
                    
                    const backup = {
                      metadata: {
                        version: "1.0",
                        timestamp: new Date().toISOString(),
                        app: "Lyfe Sync Studio"
                      },
                      payload
                    };

                    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `lifesync-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                  }}
                  className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95"
                  title="BACKUP"
                >
                  <Download size={18} />
                </button>
              </div>

              <div className="bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Foco</p>
                  <p className="text-base md:text-xl font-black text-slate-800 leading-none">Alta Performance</p>
                </div>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 min-h-[800px]">
          
          {/* Left Column: 3D Visualizer & Chores */}
          <div className="lg:col-span-5 xl:col-span-6 flex flex-col gap-8 lg:sticky top-24 h-fit">
            <div className="bg-slate-900 rounded-[40px] overflow-hidden relative shadow-2xl border-[8px] border-white h-[350px] lg:h-[500px]">
              <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[24px] p-4 text-white">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">AI Active</p>
                </div>
              </div>

              <CanvasErrorBoundary>
                <Canvas camera={{ position: [0, 0, 10], fov: 35 }} dpr={[1, 2]} style={{ height: '100%', width: '100%' }}>
                  <Suspense fallback={null}>
                    <Scene3D />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                  </Suspense>
                </Canvas>
              </CanvasErrorBoundary>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <div className="px-5 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em]">
                  Studio Online
                </div>
              </div>
            </div>

            <div className="h-[340px] lg:h-[400px]">
              <StudyCard />
            </div>
          </div>

            {/* Right Column: Management Dashboard */}
            <div className="lg:col-span-7 xl:col-span-6 flex flex-col gap-10 lg:gap-16">
              {/* Banner Image */}
              <div className="w-full h-[200px] lg:h-[300px] rounded-[40px] overflow-hidden shadow-xl border border-slate-100">
                <img 
                  src="https://lh3.googleusercontent.com/d/1fpRrXSG73-YcRdX1AyWCW5eTH6hPbviy" 
                  alt="Banner" 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Section 1: Dashboard Overviews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
                <div className="h-[480px] lg:h-[520px]">
                  <ProjectBoard />
                </div>
                <div className="h-[480px] lg:h-[520px]">
                  <CollaborativeTasks />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
                <div className="h-[450px]">
                  <TaskCard />
                </div>
                <div className="h-[450px]">
                  <ProductionCard />
                </div>
              </div>

              {/* Mind Map Section */}
              <div className="h-[600px] w-full">
                <MindMapCard />
              </div>
            </div>

        </div>

        {/* Footer info */}
        <footer className="mt-20 border-t border-slate-200 pt-8 pb-12 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-medium">
          <p>© 2026 Sync Studio</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Suporte</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
