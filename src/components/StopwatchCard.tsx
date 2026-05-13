import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Timer, Flag, Trash2, Clock } from 'lucide-react';

interface Lap {
  id: string;
  time: number;
  overallTime: number;
}

export default function StopwatchCard() {
  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('stopwatch_active');
    return saved ? JSON.parse(saved) : false;
  });
  const [time, setTime] = useState(() => {
    const savedTime = localStorage.getItem('stopwatch_time');
    const lastTimestamp = localStorage.getItem('stopwatch_timestamp');
    const active = localStorage.getItem('stopwatch_active');
    
    let baseTime = savedTime ? parseInt(savedTime, 10) : 0;
    if (active === 'true' && lastTimestamp) {
      baseTime += Date.now() - parseInt(lastTimestamp, 10);
    }
    return baseTime;
  });
  const [laps, setLaps] = useState<Lap[]>(() => {
    const saved = localStorage.getItem('stopwatch_laps');
    return saved ? JSON.parse(saved) : [];
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('stopwatch_active', JSON.stringify(isActive));
    localStorage.setItem('stopwatch_laps', JSON.stringify(laps));
  }, [isActive, laps]);

  useEffect(() => {
    localStorage.setItem('stopwatch_time', time.toString());
    localStorage.setItem('stopwatch_timestamp', Date.now().toString());
  }, [time]);

  useEffect(() => {
    if (isActive) {
      const startTime = Date.now() - time;
      timerRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const toggleStopwatch = () => setIsActive(!isActive);

  const resetStopwatch = () => {
    setIsActive(false);
    setTime(0);
    setLaps([]);
  };

  const addLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].overallTime : 0;
    const currentLapTime = time - lastLapTime;
    const newLap: Lap = {
      id: Math.random().toString(36).substr(2, 9),
      time: currentLapTime,
      overallTime: time
    };
    setLaps([newLap, ...laps]);
    
    // Auto scroll to top of laps
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const deleteLap = (id: string) => {
    setLaps(laps.filter(lap => lap.id !== id));
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      h: hours.toString().padStart(2, '0'),
      m: minutes.toString().padStart(2, '0'),
      s: seconds.toString().padStart(2, '0'),
      ms: centiseconds.toString().padStart(2, '0')
    };
  };

  const t = formatTime(time);

  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-[40px] p-8 h-full flex flex-col items-center relative overflow-hidden shadow-2xl group">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
      
      <div className="w-full flex justify-between items-center z-10 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock size={20} className={isActive ? 'animate-pulse' : ''} />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Módulo de Precisão</h3>
            <p className="text-sm font-black text-white tracking-widest uppercase">Cronômetro</p>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {/* Main Display */}
        <div className="relative mb-10">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{t.h}</span>
            <span className="text-2xl font-black text-indigo-500/50">:</span>
            <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{t.m}</span>
            <span className="text-2xl font-black text-indigo-500/50">:</span>
            <span className="text-6xl font-black text-white tracking-tighter tabular-nums">{t.s}</span>
            <span className="text-3xl font-black text-indigo-400 tabular-nums ml-2 opacity-50">{t.ms}</span>
          </div>
          
          {/* Progress Indicator */}
          <div className="absolute -bottom-4 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-indigo-50"
               animate={{ width: isActive ? "100%" : "0%" }}
               transition={{ duration: 1, repeat: isActive ? Infinity : 0, ease: "linear" }}
             />
          </div>
        </div>

        {/* Lap History */}
        <div className="w-full h-32 mb-8 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-2">
             <p className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
               <Flag size={10} /> Voltas ({laps.length})
             </p>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2"
          >
            {laps.length === 0 ? (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-20">
                <span className="text-[9px] font-black uppercase tracking-widest">Aguardando records...</span>
              </div>
            ) : (
              laps.map((lap, index) => {
                const lt = formatTime(lap.time);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={lap.id}
                    className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between group/lap"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-indigo-500 w-4">#{laps.length - index}</span>
                      <p className="text-xs font-black text-white uppercase tracking-tight tabular-nums">
                        {lt.m}:{lt.s}.{lt.ms}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteLap(lap.id)}
                      className="p-1 text-white/10 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover/lap:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-3 gap-4 relative z-10">
        <button
          onClick={resetStopwatch}
          className="aspect-square bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={toggleStopwatch}
          className={`aspect-square rounded-[32px] flex items-center justify-center transition-all active:scale-95 shadow-2xl ${
            isActive 
              ? 'bg-rose-500 text-white shadow-rose-500/20' 
              : 'bg-indigo-600 text-white shadow-indigo-500/20'
          }`}
        >
          {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>

        <button
          onClick={addLap}
          disabled={!isActive && time === 0}
          className="aspect-square bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <Flag size={20} />
        </button>
      </div>
    </div>
  );
}
