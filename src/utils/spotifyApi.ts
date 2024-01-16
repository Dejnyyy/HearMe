// utils/spotifyApi.ts
import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

export const searchSpotifySongs = async (query: string, accessToken: string) => {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE_URL}/search`, {
      params: {
        q: query,
        type: 'track',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error searching Spotify songs:', error);
    throw error;
  }
};

async function getAccessToken(): Promise<string> {
  try {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';

    const response = await axios.post(
      tokenEndpoint,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = response.data.access_token;
    console.log(`Access token: ${accessToken}`);
    return accessToken;
  } catch (error) {
    console.error('Error obtaining access token:', error);
    throw new Error('Failed to obtain access token');
  }
}

export { getAccessToken };
