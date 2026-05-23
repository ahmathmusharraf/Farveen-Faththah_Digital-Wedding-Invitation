import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Auto-play ambient instrumental/nasheed when invitation is opened/revealed
  useEffect(() => {
    const handleUnveilInvitation = () => {
      if (!isPlaying) {
        startPlayback();
      }
    };
    window.addEventListener('unveil-invitation', handleUnveilInvitation);
    return () => {
      window.removeEventListener('unveil-invitation', handleUnveilInvitation);
    };
  }, [isPlaying]);

  const startPlayback = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Send play command to YouTube iframe player
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
        // Set dynamic soft background volume
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [60] }),
          '*'
        );
        setIsPlaying(true);
      } catch (err) {
        console.error("Failed to trigger YouTube playback", err);
      }
    }
  };

  const pausePlayback = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Send pause command to YouTube iframe player
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
        setIsPlaying(false);
      } catch (err) {
        console.error("Failed to pause YouTube playback", err);
      }
    }
  };

  const toggleSound = () => {
    if (!isPlaying) {
      startPlayback();
    } else {
      pausePlayback();
    }
  };

  return (
    <div id="ambient-player-bar" className="fixed bottom-5 right-5 z-40">
      {/* Invisible YouTube Player API wrapper with loop and background autoplay pre-buffered */}
      <iframe
        ref={iframeRef}
        id="youtube-bg-audio-player"
        src="https://www.youtube.com/embed/7H5372PZRdk?enablejsapi=1&autoplay=0&controls=0&loop=1&playlist=7H5372PZRdk&volume=60&mute=0&playsinline=1"
        title="Background Wedding Melody"
        className="pointer-events-none absolute w-0 h-0 opacity-0"
        style={{ border: 0, width: 0, height: 0 }}
        allow="autoplay; encrypted-media"
      />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSound}
        className={`px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2 text-xs font-semibold font-sans cursor-pointer transition-all duration-300 ${
          isPlaying
            ? 'bg-gradient-to-r from-emerald-800 to-emerald-950 text-amber-200 border-emerald-700 animate-pulse'
            : 'bg-white/90 text-emerald-950 border-amber-200/60 hover:bg-amber-50'
        }`}
        title={isPlaying ? "Mute background music" : "Play beautiful background wedding music"}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-amber-300' : 'bg-emerald-800'}`}></span>
        </span>
        
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 text-amber-300 animate-bounce" />
            <span className="text-amber-100 font-medium">Bayati Nasheed Active</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-emerald-950/75" />
            <span className="hidden md:inline">Play Wedding Music</span>
            <span className="md:hidden">Play Music</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
