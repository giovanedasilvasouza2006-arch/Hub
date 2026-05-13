
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  MousePointer2,
  Grab,
  Type,
  MoreVertical,
  PlusCircle,
  X
} from 'lucide-react';

interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

interface MindMap {
  id: string;
  name: string;
  nodes: MindNode[];
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
];

export const MindMapCard = () => {
  const [maps, setMaps] = useState<MindMap[]>(() => {
    const saved = localStorage.getItem('life_mindmaps_v5');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'root-map',
      name: 'Meu Primeiro Mapa',
      nodes: [{
        id: 'node-root',
        text: 'Idéia Central',
        x: 0,
        y: 0,
        parentId: null,
        color: '#3b82f6'
      }]
    }];
  });

  const [activeMapId, setActiveMapId] = useState(maps[0].id);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [linkingFromId, setLinkingFromId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeMap = maps.find(m => m.id === activeMapId) || maps[0];

  const centralize = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  useEffect(() => {
    localStorage.setItem('life_mindmaps_v5', JSON.stringify(maps));
  }, [maps]);

  const updateNode = (nodeId: string, updates: Partial<MindNode>) => {
    setMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return {
        ...m,
        nodes: m.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
      };
    }));
  };

  const addNode = (parentId: string | null) => {
    const parent = activeMap.nodes.find(n => n.id === parentId);
    const newNode: MindNode = {
      id: `node-${Date.now()}`,
      text: 'Novo Ponto',
      x: parent ? parent.x + 150 : 0,
      y: parent ? parent.y + (Math.random() * 100 - 50) : 0,
      parentId,
      color: parent ? parent.color : COLORS[Math.floor(Math.random() * COLORS.length)]
    };

    setMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      return { ...m, nodes: [...m.nodes, newNode] };
    }));
  };

  const deleteNode = (nodeId: string) => {
    setMaps(prev => prev.map(m => {
      if (m.id !== activeMapId) return m;
      // Also delete children recursively
      const toDelete = new Set([nodeId]);
      let changed = true;
      while (changed) {
        changed = false;
        m.nodes.forEach(n => {
          if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
            toDelete.add(n.id);
            changed = true;
          }
        });
      }
      return { ...m, nodes: m.nodes.filter(n => !toDelete.has(n.id)) };
    }));
  };

  const createNewMap = () => {
    const name = prompt('Nome do novo mapa mental:');
    if (!name) return;
    const newId = `map-${Date.now()}`;
    const newMap: MindMap = {
      id: newId,
      name,
      nodes: [{
        id: `node-root-${Date.now()}`,
        text: name,
        x: 0,
        y: 0,
        parentId: null,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      }]
    };
    setMaps(prev => [...prev, newMap]);
    setActiveMapId(newId);
  };

  const deleteMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (maps.length <= 1) {
      alert('Você precisa de pelo menos um mapa!');
      return;
    }
    if (!confirm('Deseja realmente deletar este mapa?')) return;
    
    const newMaps = maps.filter(m => m.id !== id);
    setMaps(newMaps);
    if (activeMapId === id) {
      setActiveMapId(newMaps[0].id);
    }
  };

  const renameMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const map = maps.find(m => m.id === id);
    if (!map) return;
    const newName = prompt('Novo nome para o mapa:', map.name);
    if (!newName) return;
    setMaps(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      setZoom(z => Math.min(Math.max(0.2, z - e.deltaY * 0.001), 2));
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative group">
      {/* HUD Header */}
      <div className="absolute top-8 left-8 right-8 z-20 flex flex-col gap-6 pointer-events-none">
        <div className="flex items-center justify-between">
          <div className="flex flex-col pointer-events-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Mapa Mental</span>
            </div>
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <AnimatePresence>
              {linkingFromId && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2"
                >
                  <Network size={12} />
                  <span>Selecione o destino para ligar</span>
                  <button onClick={() => setLinkingFromId(null)} className="ml-2 bg-white/20 p-1 rounded-md hover:bg-white/30">
                    <X size={10} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center gap-4">
              <button 
                onClick={centralize}
                className="text-white/40 hover:text-white flex items-center gap-2 px-2 hover:bg-white/5 rounded-lg transition-all"
                title="Centralizar"
              >
                <MousePointer2 size={16} />
              </button>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="text-white/40 hover:text-white"><Minimize2 size={16} /></button>
              <span className="text-[10px] font-black text-white/60 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="text-white/40 hover:text-white"><Maximize2 size={16} /></button>
            </div>
          </div>
        </div>

        {/* Innovative Tabs */}
        <div className="flex items-center gap-2 pointer-events-auto overflow-x-auto pb-4 no-scrollbar">
          {maps.map(m => (
            <div key={m.id} className="relative group/tab">
              <div className="relative">
                {activeMapId === m.id ? (
                  <input 
                    value={m.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setMaps(prev => prev.map(map => map.id === m.id ? { ...map, name: newName } : map));
                    }}
                    className="bg-transparent border-none text-white font-black text-xs tracking-widest uppercase outline-none px-6 py-3 min-w-[150px] transition-all"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setActiveMapId(m.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs tracking-widest whitespace-nowrap transition-all border ${
                      activeMapId === m.id 
                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20 pr-12' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {m.name.toUpperCase()}
                  </button>
                )}
              </div>
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/tab:opacity-100 transition-all">
                <button 
                  onClick={(e) => renameMap(m.id, e)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
                >
                  <Type size={12} />
                </button>
                <button 
                  onClick={(e) => deleteMap(m.id, e)}
                  className="p-1 hover:bg-red-500/20 rounded-lg text-white/40 hover:text-red-400"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={createNewMap}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-dashed border-blue-500/30 text-blue-400 rounded-2xl transition-all font-black text-xs uppercase tracking-[0.2em]"
          >
            <Plus size={16} />
            <span>Novo Mapa</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={`flex-1 relative overflow-hidden cursor-${isPanning ? 'grabbing' : 'crosshair'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Decorative Grid */}
          <div className="absolute inset-[-5000px] bg-[radial-gradient(circle_at_center,#ffffff05_1px,transparent_1px)] bg-[size:100px_100px]" />

          {/* Connectors (SVG) */}
          <svg className="absolute inset-[-5000px] w-[10000px] h-[10000px]">
             {activeMap.nodes.map(node => {
               if (!node.parentId) return null;
               const parent = activeMap.nodes.find(n => n.id === node.parentId);
               if (!parent) return null;
               
               const startX = parent.x + 5000;
               const startY = parent.y + 5000;
               const endX = node.x + 5000;
               const endY = node.y + 5000;
               
               // Bezier curve
               const cp1x = startX + (endX - startX) / 2;
               const cp2x = startX + (endX - startX) / 2;

               return (
                 <path 
                   key={`edge-${node.id}`}
                   d={`M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`}
                   fill="none"
                   stroke={node.color}
                   strokeWidth="3"
                   strokeOpacity="0.3"
                   strokeLinecap="round"
                 />
               );
             })}

             {/* Linking Line Preview */}
             {linkingFromId && (
                (() => {
                  const sourceNode = activeMap.nodes.find(n => n.id === linkingFromId);
                  if (!sourceNode) return null;
                  
                  // Use container-relative mouse position for preview line
                  // This is tricky because we're inside a transformed div.
                  // Simpler: Just don't show the preview line if it's too complex or 
                  // just show a line to the current 'mouse' in canvas coords.
                  return null;
                })()
             )}
          </svg>

          {/* Nodes */}
          {activeMap.nodes.map(node => (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              onDrag={(e, info) => {
                updateNode(node.id, { x: node.x + info.delta.x / zoom, y: node.y + info.delta.y / zoom });
              }}
              style={{
                x: node.x,
                y: node.y,
                position: 'absolute',
                top: '50%',
                left: '50%',
              }}
              className="pointer-events-auto z-10"
            >
              <div className="relative group/node flex items-center justify-center">
                {/* Node Body */}
                <div 
                  onClick={() => {
                    if (linkingFromId && linkingFromId !== node.id) {
                      updateNode(node.id, { parentId: linkingFromId });
                      setLinkingFromId(null);
                    }
                  }}
                  className={`px-6 py-4 rounded-[28px] border-2 shadow-2xl backdrop-blur-xl transition-all min-w-[140px] text-center cursor-pointer ${
                    linkingFromId === node.id ? 'ring-4 ring-blue-500 border-blue-500 scale-110' : ''
                  } ${
                    node.parentId === null 
                      ? 'bg-white text-slate-900 border-white ring-8 ring-white/5' 
                      : 'bg-black/40 text-white border-white/10 hover:border-white/30'
                  }`}
                >
                  <input 
                    value={node.text}
                    onChange={(e) => updateNode(node.id, { text: e.target.value })}
                    className="bg-transparent border-none text-center outline-none w-full font-black text-sm tracking-tight placeholder:text-white/20"
                    placeholder="Escreva algo..."
                  />
                  
                  {/* Floating Toolbar (appear on hover) */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover/node:opacity-100 transition-all scale-90 group-hover/node:scale-100 bg-slate-800 rounded-full p-2 border border-white/10 shadow-xl">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addNode(node.id); }}
                      className="p-1.5 hover:bg-blue-500 rounded-full text-white transition-colors"
                      title="Adicionar Filho"
                    >
                      <PlusCircle size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextColor = COLORS[(COLORS.indexOf(node.color) + 1) % COLORS.length];
                        updateNode(node.id, { color: nextColor });
                      }}
                      className="p-1.5 hover:bg-slate-700 rounded-full text-white transition-colors"
                      title="Trocar Cor"
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setLinkingFromId(linkingFromId === node.id ? null : node.id); }}
                      className={`p-1.5 rounded-full text-white transition-colors ${linkingFromId === node.id ? 'bg-blue-600' : 'hover:bg-indigo-500'}`}
                      title="Ligar a outro ponto"
                    >
                      <Network size={16} />
                    </button>
                    {node.parentId !== null && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateNode(node.id, { parentId: null }); }}
                        className="p-1.5 hover:bg-slate-700 rounded-full text-white transition-colors"
                        title="Remover Ligação"
                      >
                        <X size={16} />
                      </button>
                    )}
                    {node.parentId !== null && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                        className="p-1.5 hover:bg-red-500 rounded-full text-white transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Visual Connector Dot */}
                <div 
                  className="absolute -right-1 w-2 h-6 rounded-full" 
                  style={{ backgroundColor: node.color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-center pointer-events-none">
        <div className="bg-white/5 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-4 pointer-events-auto overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <Grab size={14} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 hidden sm:inline">Arrastar</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <PlusCircle size={14} className="text-green-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 hidden sm:inline">Ramos</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Network size={14} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white/40 hidden sm:inline">Ligar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
