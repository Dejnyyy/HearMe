// server.ts
import express, { Request, Response } from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import { env } from '~/env.mjs';


const app = express();
const PORT = 3001;

app.use(bodyParser.json());

// Spotify API creds
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;

// Endpoint to handle the search request
app.get('/search', async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    // Base64 encode the client ID and secret
    const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Request a token from the Spotify API
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Make a search request to the Spotify API using the obtained token
    const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
      },
    });

    res.json(searchResponse.data.tracks.items);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
