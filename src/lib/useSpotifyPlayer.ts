import { useState, useEffect } from 'react';

interface SpotifyPlayer {
  device_id: string;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
  togglePlay: () => Promise<void>;
}

export function useSpotifyPlayer(accessToken: string | null) {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let spotifyPlayer: SpotifyPlayer | null = null;

    const initializePlayer = () => {
      console.log('[Spotify] SDK ready, initializing player...');
      try {
        spotifyPlayer = new window.Spotify.Player({
          name: 'Spotify Clone Web Player',
          getOAuthToken: cb => cb(accessToken),
          volume: 0.5
        });

        // Error handling
        spotifyPlayer.addListener('initialization_error', ({ message }) => {
          console.error('[Spotify] Failed to initialize:', message);
        });

        spotifyPlayer.addListener('authentication_error', ({ message }) => {
          console.error('[Spotify] Failed to authenticate:', message);
        });

        spotifyPlayer.addListener('account_error', ({ message }) => {
          console.error('[Spotify] Failed to validate Spotify account:', message);
          alert('Spotify Premium is required to play music through the web player.');
        });

        spotifyPlayer.addListener('playback_error', ({ message }) => {
          console.error('[Spotify] Failed to perform playback:', message);
        });

        // Ready handling
        spotifyPlayer.addListener('ready', async ({ device_id }) => {
          console.log('[Spotify] Player ready with Device ID:', device_id);
          setDeviceId(device_id);
          setIsReady(true);

          // Automatically activate this device when ready
          try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                device_ids: [device_id],
                play: false
              })
            });

            if (response.ok) {
              console.log('[Spotify] Device activated successfully');
            } else {
              console.error('[Spotify] Failed to activate device:', await response.text());
            }
          } catch (error) {
            console.error('[Spotify] Error activating device:', error);
          }
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
          console.log('[Spotify] Device ID has gone offline:', device_id);
          setIsReady(false);
        });

        const handleStateChange = (state: any) => {
          if (!state) {
            console.log('[Spotify] No playback state available');
            return;
          }
          setCurrentTrack(state.track_window.current_track);
          setIsPaused(state.paused);
        };

        spotifyPlayer.addListener('player_state_changed', handleStateChange);

        // Connect the player
        spotifyPlayer.connect().then(success => {
          if (success) {
            console.log('[Spotify] Player connected successfully');
            setPlayer(spotifyPlayer);
          } else {
            console.error('[Spotify] Failed to connect the player');
          }
        });
      } catch (error) {
        console.error('[Spotify] Error initializing player:', error);
      }
    };

    // Wait for SDK to be ready
    if (window.Spotify) {
      initializePlayer();
    } else {
      window.addEventListener('spotify-sdk-ready', initializePlayer, { once: true });
    }

    return () => {
      if (spotifyPlayer) {
        console.log('[Spotify] Cleaning up player...');
        spotifyPlayer.disconnect();
        setPlayer(null);
        setIsReady(false);
        setDeviceId(null);
      }
    };
  }, [accessToken]);

  return { player, isReady, currentTrack, isPaused, deviceId };
}