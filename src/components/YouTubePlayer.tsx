import React, { useState, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Volume2, VolumeX } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
}

const YouTubePlayer = ({ videoId }: YouTubePlayerProps) => {
  const [volume, setVolume] = useState(25);
  const playerRef = useRef<any>(null);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(volume);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      loop: 1,
      playlist: videoId,
    },
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-[320px]">
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 group transition-all hover:scale-[1.01]">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onPlayerReady}
          iframeClassName="absolute inset-0 w-full h-full"
          className="absolute inset-0"
        />
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <div className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow-lg">
            Live Studio
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm">
        <button 
          onClick={() => {
            if (volume > 0) {
              setVolume(0);
              if (playerRef.current) playerRef.current.setVolume(0);
            } else {
              setVolume(25);
              if (playerRef.current) playerRef.current.setVolume(25);
            }
          }}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-colors"
        >
          {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} className="text-blue-500" />}
        </button>
        <input 
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-[10px] font-bold text-slate-500 min-w-[24px] tracking-tighter">
          {volume}%
        </span>
      </div>
    </div>
  );
};

export default YouTubePlayer;
