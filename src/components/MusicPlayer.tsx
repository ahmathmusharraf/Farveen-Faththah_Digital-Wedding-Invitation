import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { motion } from 'motion/react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Defer iframe rendering until after the main page load sequence is completely finished
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIframeLoaded(true);
    }, 2500); // 2.5 seconds gives Safari plenty of time to mark the page flow as 'Done loading'
    return () => clearTimeout(timer);
  }, []);

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

  // Handle document level initial interaction to auto-play background music
  useEffect(() => {
    const handleFirstGesture = () => {
      if (!isPlaying) {
        startPlayback();
      }
    };
    
    document.addEventListener('click', handleFirstGesture, { once: true });
    document.addEventListener('touchstart', handleFirstGesture, { once: true });
    
    return () => {
      document.removeEventListener('click', handleFirstGesture);
      document.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [isPlaying]);

  const startPlayback = () => {
    if (!isIframeLoaded) {
      setIsIframeLoaded(true);
      // Wait for React to mount the iframe element, then command play
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
              '*'
            );
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'setVolume', args: [60] }),
              '*'
            );
            iframeRef.current.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
              '*'
            );
          } catch (e) {
            console.error(e);
          }
        }
      }, 300);
      setIsPlaying(true);
      return;
    }

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
        // Ensure unmuted
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'unMute', args: '' }),
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
      {isIframeLoaded && (
        <iframe
          ref={iframeRef}
          id="youtube-bg-audio-player"
          src="https://www.youtube.com/embed/7H5372PZRdk?enablejsapi=1&autoplay=1&controls=0&loop=1&playlist=7H5372PZRdk&volume=60&mute=0&playsinline=1&start=3"
          title="Background Wedding Melody"
          className="pointer-events-none absolute w-0 h-0 opacity-0"
          style={{ border: 0, width: 0, height: 0 }}
          allow="autoplay; encrypted-media"
        />
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSound}
        className={`px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-md flex items-center gap-2 text-xs font-semibold font-sans cursor-pointer transition-all duration-300 ${
          isPlaying
            ? 'bg-[#1b1511] text-amber-200 border-amber-500/40 shadow-[0_4px_12px_rgba(0,0,0,0.4)] animate-pulse'
            : 'bg-white/95 text-emerald-950 border-amber-200/60 hover:bg-amber-50'
        }`}
        title={isPlaying ? "Stop music" : "Play beautiful background wedding music"}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-amber-300' : 'bg-[#7c1d1a]'}`}></span>
        </span>
        
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="text-amber-100 font-medium">Stop Music</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 text-emerald-800 fill-emerald-800/10" />
            <span className="hidden md:inline">Play Wedding Music</span>
            <span className="md:hidden">Play Music</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
