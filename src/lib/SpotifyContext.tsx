import React, { useState, useEffect, createContext, useContext } from 'react';

interface SpotifyContextType {
  isAuthenticated: boolean;
  currentTrack: any;
  playbackState: {
    position: number;
    duration: number;
  };
  playTrack: (uri: string) => Promise<void>;
  togglePlay: () => Promise<void>;
  seekToPosition: (positionMs: number) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  toggleShuffle: () => Promise<void>;
  toggleRepeat: () => Promise<void>;
  setVolume: (volumePercent: number) => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

// Demo track data
const demoTracks = {
  '0T5iIrXA4p5GsubkhuBIKV': {
    name: 'Until I Found You',
    artists: [{ name: 'Stephen Sanchez' }],
    album: {
      images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2737d8135f3a9c09b966c978860?w=300' }]
    },
    duration_ms: 177000
  },
  // Add more demo tracks as needed
};

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [playbackState, setPlaybackState] = useState({ position: 0, duration: 177000 });
  const [isPaused, setIsPaused] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'context' | 'track'>('off');
  const [playbackInterval, setPlaybackInterval] = useState<NodeJS.Timeout | null>(null);

  // Simulate playback progress
  useEffect(() => {
    if (!isPaused && currentTrack) {
      const interval = setInterval(() => {
        setPlaybackState(prev => ({
          ...prev,
          position: (prev.position + 1000) % prev.duration
        }));
      }, 1000);
      setPlaybackInterval(interval);
    } else if (playbackInterval) {
      clearInterval(playbackInterval);
      setPlaybackInterval(null);
    }
    return () => {
      if (playbackInterval) {
        clearInterval(playbackInterval);
      }
    };
  }, [isPaused, currentTrack]);

  const seekToPosition = async (positionMs: number) => {
    // Update local state immediately for smooth UI feedback
    setPlaybackState(prev => ({
      ...prev,
      position: positionMs
    }));
  };

  const playTrack = async (uri: string) => {
    const trackId = uri.split(':').pop();
    const track = demoTracks[trackId as keyof typeof demoTracks];
    if (track) {
      setCurrentTrack(track);
      setPlaybackState({ position: 0, duration: track.duration_ms });
      setIsPaused(false);
    }
  };

  const togglePlay = async () => {
    setIsPaused(!isPaused);
  };

  const skipToNext = async () => {
    // Demo implementation could cycle through available tracks
    console.log('Skip to next (demo)');
  };

  const skipToPrevious = async () => {
    // Demo implementation could cycle through available tracks
    console.log('Skip to previous (demo)');
  };

  const toggleShuffle = async () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = async () => {
    const newRepeatMode = repeatMode === 'off' ? 'context' : repeatMode === 'context' ? 'track' : 'off';
    setRepeatMode(newRepeatMode);
  };

  const setVolume = async (volumePercent: number) => {
    // Demo implementation - volume control simulation
    console.log('Volume set to:', volumePercent);
  };
  
  return (
    <SpotifyContext.Provider value={{
      isAuthenticated: true, // Always authenticated in demo mode
      currentTrack,
      playbackState,
      isPaused,
      isShuffled,
      repeatMode,
      playTrack,
      togglePlay,
      seekToPosition,
      skipToNext,
      skipToPrevious,
      toggleShuffle,
      toggleRepeat,
      setVolume,
    }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};