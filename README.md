# Spotify Clone with React and TypeScript

A full-featured Spotify web player clone built with React, TypeScript, and Tailwind CSS, featuring complete Spotify Web Playback SDK integration.
Link without oAuth: https://spotify-clone-amar.netlify.app/

## Features

- 🎵 Full Spotify Web Playback SDK integration
- 🔐 OAuth 2.0 authentication flow
- 🔄 Real-time playback state synchronization
- 🎨 Responsive Spotify-like UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🔍 Type-safe implementation with TypeScript
- ⚡ Premium feature detection and graceful degradation

## Architecture Overview

The application follows a Context-based architecture pattern in React, consisting of three main components:

1. **SpotifyContext**: Core state management and authentication logic
2. **SpotifyPlayer Hook**: Web Playback SDK integration
3. **Netlify Functions**: Server-side OAuth flow handling

## Prerequisites

1. Create a Spotify Developer Account:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new application
   - Note down the `Client ID` and `Client Secret`
   - Add `${YOUR_SITE_URL}/.netlify/functions/spotify-auth` to the Redirect URIs

2. Required Environment Variables:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   ```

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Spotify credentials
4. Start the development server:
   ```bash
   npm run dev
   ```

## Spotify Developer Dashboard Setup

1. Register your application:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Click "Create an App"
   - Fill in the application name and description
   - Accept the terms and conditions

2. Configure your application:
   - Note down the Client ID and Client Secret
   - Click "Edit Settings"
   - Add Redirect URIs:
     - `https://your-site.netlify.app/.netlify/functions/spotify-auth`
   - Save the changes

## Core Features

### Authentication Flow
The application implements the OAuth 2.0 Authorization Code flow:

```typescript
// Redirect to Spotify auth endpoint
const login = () => {
  window.location.href = '/.netlify/functions/spotify-auth';
};
```

### Playback Control
```typescript
const {
  playTrack,    // Play a specific track or playlist
  togglePlay,   // Toggle play/pause
  skipToNext,   // Skip to next track
  skipToPrevious, // Skip to previous track
  seekToPosition, // Seek to specific position
  setVolume,    // Adjust volume
  toggleShuffle, // Toggle shuffle mode
  toggleRepeat   // Cycle repeat modes
} = useSpotify();
```

### Premium Features
The application includes premium feature detection and appropriate user feedback:

```typescript
const handlePremiumFeature = async () => {
  try {
    await toggleShuffle();
  } catch (error) {
    if (error.reason === 'PREMIUM_REQUIRED') {
      alert('This feature requires Spotify Premium');
    }
  }
};
```

## Implementation Examples

### Basic Player Integration
```typescript
function Player() {
  const { 
    isAuthenticated, 
    currentTrack, 
    playTrack 
  } = useSpotify();

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div>
      <h1>{currentTrack?.name}</h1>
      <button onClick={() => playTrack('spotify:track:id')}>
        Play
      </button>
    </div>
  );
}
```

### Playback State Synchronization
```typescript
function usePlaybackSync() {
  const { playbackState, seekToPosition } = useSpotify();
  const [localPosition, setLocalPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalPosition(playbackState.position);
    }
  }, [playbackState.position, isDragging]);

  return {
    position: localPosition,
    isDragging,
    handleSeek: setLocalPosition,
    handleSeekComplete: () => seekToPosition(localPosition)
  };
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
