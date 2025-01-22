export const playTrack = async (trackUri: string) => {
  try {
    const response = await fetch('/.netlify/functions/spotify-player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trackUri }),
    });

    if (!response.ok) {
      throw new Error('Failed to play track');
    }

    return true;
  } catch (error) {
    console.error('Error playing track:', error);
    return false;
  }
};

export const initiateSpotifyAuth = () => {
  window.location.href = '/.netlify/functions/spotify-auth';
};