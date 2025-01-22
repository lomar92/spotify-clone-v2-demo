import { Handler } from '@netlify/functions';

const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.Spotify_Client_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || process.env.Spotify_client_secret;
const redirectUri = process.env.URL ? `${process.env.URL}/.netlify/functions/spotify-auth` : '';

const handler: Handler = async (event) => {
  console.log('Auth function called with method:', event.httpMethod);
  
  // Handle the initial auth request
  if (event.httpMethod === 'GET' && !event.queryStringParameters.code) {
    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing required environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing configuration' })
      };
    }

    const scope = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    return {
      statusCode: 302,
      headers: {
        Location: authUrl,
      },
    };
  }

  // Handle the callback from Spotify
  if (event.httpMethod === 'GET' && event.queryStringParameters.code) {
    const code = event.queryStringParameters.code;
    console.log('Received auth code from Spotify');
    
    try {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(`Failed to get access token: ${data.error}`);
      }

      // Get the domain from the URL environment variable
      const domain = process.env.URL ? new URL(process.env.URL).hostname : '';
      
      // Set a single cookie with the access token
      const cookieHeader = `spotify_access_token=${data.access_token}; Path=/; Max-Age=${data.expires_in}; Secure; SameSite=Lax`;

      return {
        statusCode: 302,
        headers: {
          'Set-Cookie': cookieHeader,
          'Location': '/',
          'Cache-Control': 'no-cache'
        },
      };
    } catch (error) {
      console.error('Auth error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to authenticate with Spotify' }),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Invalid request' }),
  };
};

export { handler };