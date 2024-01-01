import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  try {
    // Fetch the access token dynamically using your method (e.g., from a function)
    const yourAccessToken = await getAccessToken();

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

// Function to get access token (replace with your actual implementation)
async function getAccessToken(): Promise<string> {
  // Implement your logic to obtain the access token
  // This could involve making a request to the Spotify token endpoint or using your authentication method
  // Return the obtained access token
  return 'your_actual_access_token';
}
