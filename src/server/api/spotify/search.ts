import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { env } from '~/env.mjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;
 
  try {
    // Function to get access token (replace with your actual implementation)
    const yourAccessToken = await getAccessToken(clientId, clientSecret);

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${yourAccessToken}`,
      },
      params: {
        q: query,
        type: 'track',
      },
    });

    res.json(response.data.tracks.items);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenEndpoint = 'https://accounts.spotify.com/api/token';

  try {
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
