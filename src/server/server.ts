// Import necessary modules and types
import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import fetch from 'node-fetch';
import { env } from "~/env.mjs";
// Initialize express
const app = express();
app.use(cors());

const port = 3000;

const spotify_client_id = env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = env.SPOTIFY_CLIENT_SECRET;

// Load access token from file
let spotify_access_token = "";

async function getToken() {
    try {
        // Try reading the token from the file
        spotify_access_token = fs.readFileSync('token.txt', 'utf8');
    } catch (error) {
        // If reading the file fails, fetch a new token
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: `grant_type=client_credentials&client_id=${spotify_client_id}&client_secret=${spotify_client_secret}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!response.ok) {
            throw new Error(`Error fetching token: ${response.statusText}`);
        }

        const data = await response.json(); // Extract JSON from the response

        const token = data.access_token; // Assuming the token is in the 'access_token' field
        if (!token) {
            throw new Error('Token not found in response');
        }
        spotify_access_token = token;
        fs.writeFileSync('token.txt', token); // Write the token to the file
    }
}

// TODO: add timestamp to token and refresh token
getToken().then(() => {
    console.log(spotify_access_token);
});

app.get('/refresh', async (req: Request, res: Response) => {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: `grant_type=client_credentials&client_id=${spotify_client_id}&client_secret=${spotify_client_secret}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (!response.ok) {
            throw new Error(`Error fetching token: ${response.statusText}`);
        }

        const data = await response.json();
        const newToken = data.access_token;
        spotify_access_token = newToken;
        fs.writeFileSync('token.txt', newToken);
        res.send("Token refreshed");
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/search', async (req: Request, res: Response) => {
    const query = req.query.q as string;
    const type = 'track';
    const market = 'CZ';
    const limit = 5;

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&market=${market}&limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + spotify_access_token },
        });

        if (!response.ok) {
            throw new Error(`Error from Spotify API: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from Spotify:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
