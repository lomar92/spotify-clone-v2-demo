import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  const accessToken = event.headers.cookie
    ?.split(';')
    .find(cookie => cookie.trim().startsWith('spotify_access_token='))
    ?.split('=')[1];

  if (!accessToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No access token found' }),
    };
  }

  if (event.httpMethod === 'POST') {
    const { trackUri } = JSON.parse(event.body || '{}');

    try {
      // Get available devices
      const devicesResponse = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const devicesData = await devicesResponse.json();
      
      if (!devicesResponse.ok) {
        throw new Error('Failed to get devices');
      }

      // Play the track on the active device
      const playResponse = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      });

      if (!playResponse.ok) {
        throw new Error('Failed to play track');
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Playing track' }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to play track' }),
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};

export { handler };