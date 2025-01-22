import React, { useState, useRef, useEffect } from 'react';
import { Home, Search, Library, Play, Pause, SkipBack, SkipForward, Volume1, Volume2, VolumeX, Repeat, Shuffle, 
         Heart, Mic2, ListMusic, Laptop2, Maximize2, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSpotify } from './lib/SpotifyContext';

const playlists = [
  { id: '37i9dQZF1DX1s9knjP51Oa', name: 'calm vibes', cover: 'https://i.scdn.co/image/ab67706f0000000281ee550c81bbff8053a023e8?w=300', description: 'Programming Playlist', creator: 'Spotify' },
  { id: '37i9dQZF1DX5trt9i14X7j', name: 'Coding Mode', cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da841628f00934e88e7a443ebec2?w=300', description: 'Dedicated to all the programmers out there.', creator: 'Spotify' },
  { id: '37i9dQZF1DWZ7eJRBxKzdO', name: 'Summer Dance Hits', cover: 'https://i.scdn.co/image/ab67706f00000002c69d0b9a845acfa88f9794ca?w=300', description: 'The summer needs dance hits 😎☀️', creator: 'Spotify' },
  { id: '37i9dQZF1DWYoYGBbGKurt', name: 'Lo-Fi Chill', cover: 'https://i.scdn.co/image/ab67706f00000002640aa944e9d545e4dff348c1?w=300', description: 'Chillige Lo-Fi-Beats für entspannte Momente', creator: 'Spotify' },
  { id: '37i9dQZF1DX36edUJpD76c', name: 'Modus Mio', cover: 'https://i.scdn.co/image/ab67706f000000028ca288540075fc8ac4a7163e?w=300', description: 'Playlist Takeover: All songs co-curated by Apache 207, Luciano & Spotify', creator: 'Spotify' },
  { id: '37i9dQZF1DWWQRwui0ExPn', name: 'lofi beats', cover: 'https://i.scdn.co/image/ab67706f0000000255be59b7be2929112e7ac927?w=300', description: 'Chillige Lo-Fi-Beats für entspannte Momente', creator: 'Spotify' },
];

const currentHits = [
  { id: '0T5iIrXA4p5GsubkhuBIKV', name: 'Until I Found You', artist: 'Stephen Sanchez', cover: 'https://i.scdn.co/image/ab67616d0000b2737d8135f3a9c09b966c978860?w=300', duration: '2:57' },
  { id: '1aOl53hkZGHkl2Snhr7opL', name: 'How Do I Say Goodbye', artist: 'Dean Lewis', cover: 'https://i.scdn.co/image/ab67616d0000b273991f6658282ef028f93b11e0?w=300', duration: '2:43' },
  { id: '1ugQtcwmKOXvKAYzhjncmv', name: 'Half A Man', artist: 'Dean Lewis', cover: 'https://i.scdn.co/image/ab67616d0000b273a787f718fb485b66d6219247?w=300', duration: '2:59' },
  { id: '1YHffsSjHbAFAsvwCD3U8A', name: 'Hideout', artist: 'Bru-C, Bad Boy Chiller Crew', cover: 'https://i.scdn.co/image/ab67616d0000b2732c7dc6392097a7bacf83be1c?w=300', duration: '3:08' },
];

const recommendedStations = [
  { id: 1, name: 'Hip-Hop Mix', cover: 'https://images.unsplash.com/photo-1502773860571-211a597d6e4b?w=300', description: 'Die besten Hip-Hop Tracks' },
  { id: 2, name: 'Rap Caviar', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300', description: 'Hip-Hop Hits' },
  { id: 3, name: 'RapDeutsch', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', description: 'Deutsche Rap Hits' },
];

const recentlyPlayed = [
  { id: '27NovPIUIRrOZoCHxABJwK', name: 'Industry Baby (feat. Jack Harlow)', artist: 'Lil Nas X', cover: 'https://i.scdn.co/image/ab67616d0000b273ba26678947112dff3c3158bf?w=300', duration: '3:32' },
  { id: '1bDbXMyjaUIooNwFE9wn0N', name: 'Rich Flex', artist: 'Drake & 21 Savage', cover: 'https://i.scdn.co/image/ab67616d0000b27302854a7060fccc1a66a4b5ad?w=300', duration: '3:59' },
  { id: '7mf7PlZdjQ4mPN5n2IrwSk', name: 'Immer Da', artist: 'NESS', cover: 'https://i.scdn.co/image/ab67616d00001e02220dd1dc91ddccf0f187a8ae?w=300', duration: '2:34' },
];

const categories = ['Alle', 'Playlists', 'Podcasts & Shows', 'Alben', 'Künstler*innen', 'Songs', 'Genres und Stimmungen'];

function App() {
  const { 
    isAuthenticated, 
    login, 
    playTrack, 
    togglePlay,
    seekToPosition,
    skipToNext,
    skipToPrevious,
    toggleShuffle,
    toggleRepeat,
    currentTrack, 
    playbackState,
    isPaused,
    isShuffled,
    repeatMode,
    setVolume
  } = useSpotify();

  const [volumeLevel, setVolumeLevel] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(30);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isProgressDragging, setIsProgressDragging] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Playlists');
  const [prevVolumeLevel, setPrevVolumeLevel] = useState(50);
  const [localProgress, setLocalProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Update local progress when playback state changes and we're not dragging
  useEffect(() => {
    if (!isProgressDragging) {
      setLocalProgress(playbackState.position);
    }
  }, [playbackState.position, isProgressDragging]);

  const handlePlayPlaylist = (playlistId: string) => {
    console.log('Playing playlist:', playlistId);
    const spotifyUri = `spotify:playlist:${playlistId}`;
    playTrack(spotifyUri);
  };

  const handleVolumeChange = (e: MouseEvent | React.MouseEvent) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = Math.min(Math.max((x / width) * 100, 0), 100);
      setVolumeLevel(Math.round(percentage));
      setVolume(Math.round(percentage)); // Ruft die Spotify API auf
    }
  };

  const handleProgressChange = (e: MouseEvent | React.MouseEvent) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const width = rect.width;
      const percentage = Math.min(Math.max((x / width) * 100, 0), 100);
      const newPosition = Math.round((percentage / 100) * playbackState.duration);
      setLocalProgress(newPosition);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, type: 'volume' | 'progress') => {
    if (type === 'volume') {
      setIsDragging(true);
      handleVolumeChange(e);
    } else {
      setIsProgressDragging(true);
      handleProgressChange(e);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) handleVolumeChange(e);
    if (isProgressDragging) handleProgressChange(e);
  };

  const handleMouseUp = () => {
    if (isProgressDragging) {
      seekToPosition(localProgress);
      setLocalProgress(localProgress); // Behalte die Position bei
    }
    setIsDragging(false);
    setIsProgressDragging(false);
  };

  // Aktualisiere localProgress nur wenn nicht gezogen wird
  useEffect(() => {
    if (!isProgressDragging) {
      setLocalProgress(playbackState.position);
    }
  }, [playbackState.position, isProgressDragging]);

  const handleVolumeClick = () => {
    if (isMuted) {
      // Unmute: Restore previous volume
      setVolumeLevel(prevVolumeLevel);
      setVolume(prevVolumeLevel);
      setIsMuted(false);
    } else {
      // Mute: Save current volume and set to 0
      setPrevVolumeLevel(volumeLevel);
      setVolumeLevel(0);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isDragging || isProgressDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isProgressDragging]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome Amar</h1>
          <button 
            onClick={login}
            className="bg-[#1ed760] text-black font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform"
          >
            Connect to Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Sidebar - Desktop */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex w-64 bg-black flex-col">
          {/* Top Navigation */}
          <div className="p-6 space-y-4">
            <nav className="space-y-2">
              <a href="#" className="flex items-center gap-x-4 text-gray-300 hover:text-white p-3">
                <Home size={24} />
                <span className="font-bold">Start</span>
              </a>
              <a href="#" className="flex items-center gap-x-4 text-gray-300 hover:text-white p-3">
                <Search size={24} />
                <span className="font-bold">Suchen</span>
              </a>
            </nav>
          </div>

          {/* Library Section */}
          <div className="flex-1 bg-[#121212] rounded-lg mx-2 p-2">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-x-2 text-gray-300 hover:text-white">
                <Library size={24} />
                <span className="font-bold">Deine Bibliothek</span>
              </div>
              <button className="text-gray-300 hover:text-white p-1">
                <Plus size={20} />
              </button>
            </div>

            {/* Category Filters */}
            <div className="relative">
              <div className="flex overflow-x-auto category-scrollbar px-2 py-2 gap-2 items-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap flex-shrink-0 transition-colors ${
                      selectedCategory === category
                        ? 'bg-white text-black'
                        : 'bg-[#282828] text-white hover:bg-[#383838]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Playlists Grid */}
            <div className="mt-4 space-y-2 px-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-[#282828] cursor-pointer group"
                  onClick={() => handlePlayPlaylist(playlist.id)}
                >
                  <img
                    src={playlist.cover}
                    alt={playlist.name}
                    className="w-12 h-12 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{playlist.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span>Playlist</span>
                      <span>•</span>
                      <span>{playlist.creator}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="fixed bottom-[90px] left-0 right-0 bg-gradient-to-t from-black to-transparent md:hidden z-50">
          <nav className="flex justify-around items-center p-4 bg-[#121212]">
            <a href="#" className="flex flex-col items-center text-gray-300 hover:text-white">
              <Home size={24} />
              <span className="text-xs mt-1">Start</span>
            </a>
            <a href="#" className="flex flex-col items-center text-gray-300 hover:text-white">
              <Search size={24} />
              <span className="text-xs mt-1">Suchen</span>
            </a>
            <a href="#" className="flex flex-col items-center text-gray-300 hover:text-white">
              <Library size={24} />
              <span className="text-xs mt-1">Bibliothek</span>
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-b from-[#1e3264] to-[#121212] overflow-y-auto pb-[160px] md:pb-24 relative z-0">
          {/* Top Bar */}
          <div className="sticky top-0 bg-[#1e3264]/95 px-4 md:px-8 py-4 z-10">
            <div className="flex gap-2 overflow-x-auto category-scrollbar">
              <button className="px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:scale-105 transition-transform">
                Alle
              </button>
              <button className="px-4 py-2 rounded-full bg-[#282828] text-white font-semibold text-sm hover:bg-[#383838] transition-colors">
                Musik
              </button>
              <button className="px-4 py-2 rounded-full bg-[#282828] text-white font-semibold text-sm hover:bg-[#383838] transition-colors">
                Podcasts
              </button>
            </div>
          </div>

          {/* Content Sections */}
          <div className="px-4 md:px-8 py-6">
            {/* Guten Abend Section */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-6">Guten Abend</h1>
              <div className="grid grid-cols-2 gap-4 max-h-[600px]">
                {playlists.map(playlist => (
                  <div
                    key={playlist.id}
                    onClick={() => playTrack(`spotify:playlist:${playlist.id}`)}
                    className="bg-[#282828]/70 hover:bg-[#383838] transition-colors rounded-md overflow-hidden cursor-pointer group flex items-center relative h-20"
                  >
                    <img
                      src={playlist.cover || "/placeholder.svg?height=80&width=80"}
                      alt={playlist.name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1 p-4 min-w-0">
                      <h3 
                        className="font-bold text-sm truncate"
                        title={playlist.name} /* Added title attribute for tooltip */
                       >
                         {playlist.name}
                       </h3>
                    </div>
                    <button 
                      className="w-10 h-10 bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 absolute right-2 shadow-xl"
                      aria-label={`Play ${playlist.name}`}
                    >
                      <Play size={16} fill="black" className="text-black ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Results and Songs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Result */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Top-Ergebnis</h2>
                <div className="bg-[#181818] hover:bg-[#282828] p-5 rounded-lg transition-all duration-300 group cursor-pointer h-[250px] relative">
                  <img
                    src={currentHits[0].cover}
                    alt={currentHits[0].name}
                    className="w-24 h-24 rounded shadow-lg mb-4"
                  />
                  <h3 className="text-3xl font-bold mb-2">{currentHits[0].name}</h3>
                  <p className="text-base text-gray-400 mb-4">{currentHits[0].artist}</p>
                  <button 
                    className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-105 absolute bottom-4 right-4"
                    onClick={() => playTrack(`spotify:track:${currentHits[0].id}`)}
                  >
                    <Play size={24} fill="black" className="text-black ml-1" />
                  </button>
                </div>
              </div>

              {/* Songs */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Songs</h2>
                <div className="space-y-2">
                  {currentHits.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 p-2 rounded-md hover:bg-[#282828] group cursor-pointer"
                      onClick={() => playTrack(`spotify:track:${song.id}`)}
                    >
                      <span className="w-6 text-center text-gray-400 group-hover:text-white">
                        {index + 1}
                      </span>
                      <img
                        src={song.cover}
                        alt={song.name}
                        className="w-10 h-10 rounded"
                      />
                      <div className="flex-1">
                        <h3 className="text-base font-normal">{song.name}</h3>
                        <p className="text-sm text-gray-400">{song.artist}</p>
                      </div>
                      <span className="text-sm text-gray-400">{song.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Stations */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Empfohlene Sender</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {recommendedStations.map(station => (
                  <div
                    key={station.id}
                    className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative mb-4">
                      <img
                        src={station.cover}
                        alt={station.name}
                        className="w-full aspect-square rounded object-cover shadow-lg"
                      />
                      <button className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-105 absolute bottom-0 right-4 translate-y-1/2">
                        <Play size={24} fill="black" className="text-black ml-1" />
                      </button>
                    </div>
                    <h3 className="font-bold truncate">{station.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{station.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently Played */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Zuletzt gehört</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentlyPlayed.map(track => (
                  <div
                    key={track.id}
                    className="flex items-center bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-md overflow-hidden cursor-pointer group p-4"
                    onClick={() => playTrack(`spotify:track:${track.id}`)}
                  >
                    <img
                      src={track.cover}
                      alt={track.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0 ml-4 mr-4">
                      <h3 
                        className="font-bold text-base truncate"
                        title={track.name}
                      >
                        {track.name}
                      </h3>
                      <p 
                        className="text-sm text-gray-400 truncate"
                        title={track.artist}
                      >
                        {track.artist}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-3 flex-shrink-0">
                      <span className="text-sm text-gray-400">{track.duration}</span>
                      <button className="w-10 h-10 bg-[#1ed760] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <Play size={20} fill="black" className="text-black ml-1" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Player */}
      <footer className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-[60]">
        {/* Now Playing */}
        <div className="flex items-center gap-x-4 w-[30%] min-w-[180px]">
          {currentTrack ? (
            <>
              <img 
                src={currentTrack.album.images[0].url} 
                alt={currentTrack.name}
                className="w-14 h-14 rounded"
              />
              <div className="flex flex-col">
                <h4 className="text-sm hover:underline cursor-pointer">{currentTrack.name}</h4>
                <p className="text-xs text-gray-400 hover:underline cursor-pointer">
                  {currentTrack.artists.map(artist => artist.name).join(', ')}
                </p>
              </div>
              <button className="ml-4 hidden md:block">
                <Heart size={20} className="text-gray-400 hover:text-white" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-x-4">
              <div className="w-14 h-14 bg-gray-800 rounded animate-pulse" />
              <div className="flex flex-col gap-y-2">
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center max-w-[45%] w-full gap-y-2">
          <div className="flex items-center gap-x-6">
            <button 
              className={`transition-colors duration-200 hidden md:block ${
                isShuffled 
                  ? 'text-[#1ed760] hover:text-[#1fdf64]' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={toggleShuffle}
            >
              <Shuffle size={16} />
            </button>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={skipToPrevious}
            >
              <SkipBack size={16} />
            </button>
            <button 
              className="w-8 h-8 bg-[#ffffff] hover:bg-[#ffffff99] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-200"
              onClick={togglePlay}
            >
              {isPaused ? (
                <Play size={16} className="text-black ml-0.5" fill="black" />
              ) : (
                <Pause size={16} className="text-black" fill="black" />
              )}
            </button>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={skipToNext}
            >
              <SkipForward size={16} />
            </button>
            <div className="relative hidden md:block">
              <button 
                className={`transition-colors duration-200 ${
                  repeatMode !== 'off'
                    ? 'text-[#1ed760] hover:text-[#1fdf64]'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={toggleRepeat}
              >
                <Repeat size={16} />
                {repeatMode === 'track' && (
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-x-2 w-full">
            <span className="text-[11px] text-gray-400 w-12 text-right">
              {formatTime(playbackState.position)}
            </span>
            <div 
              ref={progressBarRef}
              className="flex-1 h-1 bg-gray-600/50 rounded-full cursor-pointer group"
              onMouseDown={(e) => handleMouseDown(e, 'progress')}
              onMouseEnter={() => progressBarRef.current?.classList.add('h-[4px]')}
              onMouseLeave={() => !isProgressDragging && progressBarRef.current?.classList.remove('h-[4px]')}
            >
              <div 
                className="h-full bg-gray-400 group-hover:bg-[#1ed760] rounded-full relative"
                style={{ width: `${(localProgress / playbackState.duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            <span className="text-[11px] text-gray-400 w-12">
              {formatTime(playbackState.duration)}
            </span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="hidden md:flex items-center gap-x-2 w-[30%] justify-end">
          <button className="p-2 text-gray-400 hover:text-white">
            <ListMusic size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white">
            <Laptop2 size={16} />
          </button>
          <div className="flex items-center gap-x-2 group">
            <button 
              className="p-2 text-gray-400 group-hover:text-white"
              onClick={handleVolumeClick}
            >
              {volumeLevel === 0 || isMuted ? (
                <VolumeX size={16} />
              ) : volumeLevel < 50 ? (
                <Volume1 size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
            <div 
              ref={volumeBarRef}
              className="w-[93px] h-1 bg-gray-600/50 rounded-full cursor-pointer group"
              onMouseDown={(e) => handleMouseDown(e, 'volume')}
            >
              <div 
                className="h-full bg-gray-400 group-hover:bg-[#1ed760] rounded-full relative"
                style={{ width: `${volumeLevel}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-white">
            <Maximize2 size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;